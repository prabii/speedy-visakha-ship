import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  _id: string;
  username: string;
  vendorName: string;
  role: 'admin' | 'vendor';
  isActive: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  isAdmin: () => boolean;
  isVendor: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = localStorage.getItem('user_data');
    return !!stored;
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user_data');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Try API login first (for vendors and new admin users)
      const response = await api.users.login({ username, password });
      
      if (response.user) {
        setIsAuthenticated(true);
        setUser(response.user);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        return true;
      }
      
      // Fallback to legacy admin login
      const storedPassword = localStorage.getItem('admin_password') || 'admin123';
      if (username === 'admin' && password === storedPassword) {
        const adminUser: User = {
          _id: 'admin',
          username: 'admin',
          vendorName: 'Administrator',
          role: 'admin',
          isActive: true
        };
        setIsAuthenticated(true);
        setUser(adminUser);
        localStorage.setItem('user_data', JSON.stringify(adminUser));
        return true;
      }
      
      return false;
    } catch (error: any) {
      // Fallback to legacy admin login if API fails
      const storedPassword = localStorage.getItem('admin_password') || 'admin123';
      if (username === 'admin' && password === storedPassword) {
        const adminUser: User = {
          _id: 'admin',
          username: 'admin',
          vendorName: 'Administrator',
          role: 'admin',
          isActive: true
        };
        setIsAuthenticated(true);
        setUser(adminUser);
        localStorage.setItem('user_data', JSON.stringify(adminUser));
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('admin_authenticated');
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (user && user._id !== 'admin') {
        // API-based password change for vendors
        await api.users.changePassword({
          userId: user._id,
          oldPassword,
          newPassword
        });
        return true;
      } else {
        // Legacy admin password change
        const storedPassword = localStorage.getItem('admin_password') || 'admin123';
        
        if (oldPassword.trim() !== storedPassword) {
          return false;
        }
        
        if (newPassword.trim().length < 6) {
          return false;
        }
        
        if (oldPassword.trim() === newPassword.trim()) {
          return false;
        }
        
        localStorage.setItem('admin_password', newPassword.trim());
        return true;
      }
    } catch (error) {
      return false;
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isVendor = () => {
    return user?.role === 'vendor';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, changePassword, isAdmin, isVendor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

