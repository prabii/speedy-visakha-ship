import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Lock, User } from 'lucide-react';

const AdminLogin = () => {
  const [searchParams] = useSearchParams();
  const loginTypeParam = searchParams.get('type');
  const isVendorLogin = loginTypeParam === 'vendor';
  const isAdminLogin = loginTypeParam === 'admin';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'admin' | 'vendor'>(isVendorLogin ? 'vendor' : 'admin');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isVendorLogin) {
      setLoginType('vendor');
    } else if (isAdminLogin) {
      setLoginType('admin');
    }
  }, [isVendorLogin, isAdminLogin]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to Dashboard',
        });
        navigate('/admin/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [logoError, setLogoError] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/VZlogo.png');

  const handleLogoError = () => {
    if (logoSrc === '/vzlogo.jpg') {
      setLogoSrc('/logo.png');
    } else if (logoSrc === '/logo.png') {
      setLogoSrc('/logo.jpg');
    } else if (logoSrc === '/logo.jpg') {
      setLogoSrc('/logo.svg');
    } else {
      setLogoError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-4 mb-4">
            {!logoError && (
              <img 
                src={logoSrc} 
                alt="Visakha International Couriers" 
                className="h-16 w-auto max-w-[200px] object-contain"
                onError={handleLogoError}
              />
            )}
            <div className="text-center">
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
              <CardDescription>Enter your credentials to access the dashboard</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Login Type Selection - Only show if no specific type is requested */}
          {!isVendorLogin && !isAdminLogin && (
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
              <Button
                type="button"
                variant={loginType === 'admin' ? 'default' : 'ghost'}
                className={`flex-1 ${loginType === 'admin' ? '' : 'bg-transparent hover:bg-gray-200'}`}
                onClick={() => setLoginType('admin')}
              >
                Admin Login
              </Button>
              <Button
                type="button"
                variant={loginType === 'vendor' ? 'default' : 'ghost'}
                className={`flex-1 ${loginType === 'vendor' ? '' : 'bg-transparent hover:bg-gray-200'}`}
                onClick={() => setLoginType('vendor')}
              >
                Vendor Login
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                {loginType === 'vendor' ? 'Vendor Username / Account Number' : 'Username'}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder={loginType === 'vendor' ? 'Enter vendor username or account number' : 'Enter username'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Logging in...' : `Login as ${loginType === 'vendor' ? 'Vendor' : 'Admin'}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;

