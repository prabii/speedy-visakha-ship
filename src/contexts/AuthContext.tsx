import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });

  const login = (username: string, password: string): boolean => {
    // Get stored password or use default
    const storedPassword = localStorage.getItem('admin_password') || 'admin123';
    
    if (username === 'admin' && password === storedPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    // Get stored password or use default
    const storedPassword = localStorage.getItem('admin_password') || 'admin123';
    
    // Validate old password matches
    if (oldPassword.trim() !== storedPassword) {
      console.warn('Password change failed: Old password does not match');
      return false;
    }
    
    // Validate new password length (should be checked in UI, but double-check here)
    if (newPassword.trim().length < 6) {
      console.warn('Password change failed: New password too short');
      return false;
    }
    
    // Validate new password is different from old
    if (oldPassword.trim() === newPassword.trim()) {
      console.warn('Password change failed: New password same as old');
      return false;
    }
    
    // Store new password
    try {
      localStorage.setItem('admin_password', newPassword.trim());
      console.log('Password changed successfully');
      return true;
    } catch (error) {
      console.error('Failed to save password:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword }}>
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

