import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, LogOut, Package, Users, History, Settings, Lock, Eye, EyeOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceEntry from '@/components/InvoiceEntry';
import InvoiceHistory from '@/components/InvoiceHistory';

const AdminDashboard = () => {
  const { isAuthenticated, logout, changePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate old password is provided
    if (!oldPassword.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your current password',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate new password is provided
    if (!newPassword.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a new password',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate password length
    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate old and new passwords are different
    if (oldPassword === newPassword) {
      toast({
        title: 'Error',
        description: 'New password must be different from current password',
        variant: 'destructive',
      });
      return;
    }
    
    // Attempt to change password
    if (changePassword(oldPassword, newPassword)) {
      toast({
        title: 'Success',
        description: 'Password changed successfully. Please log in again with your new password.',
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast({
        title: 'Error',
        description: 'Current password is incorrect. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">Visakha International Couriers</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="invoice" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200 p-1.5 rounded-lg">
            <TabsTrigger 
              value="invoice"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all"
            >
              <FileText className="mr-2 h-4 w-4" />
              Invoice Entry
            </TabsTrigger>
            <TabsTrigger 
              value="shipments"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all"
            >
              <Package className="mr-2 h-4 w-4" />
              Shipments
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all"
            >
              <History className="mr-2 h-4 w-4" />
              Invoice History
            </TabsTrigger>
            <TabsTrigger 
              value="customers"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all"
            >
              <Users className="mr-2 h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoice" className="space-y-4">
            <InvoiceEntry />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <InvoiceHistory />
          </TabsContent>

          <TabsContent value="shipments" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Shipments
                </CardTitle>
                <CardDescription>Manage and track all shipments</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">Shipment management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Customers
                </CardTitle>
                <CardDescription>Manage customer information</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">Customer management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your admin password</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 characters)"
                        required
                        minLength={6}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;

