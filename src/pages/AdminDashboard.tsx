import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, LogOut, Package, Users, History, Settings, Lock, Eye, EyeOff, Search, Edit, Building2, Trash2, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceEntry from '@/components/InvoiceEntry';
import InvoiceHistory from '@/components/InvoiceHistory';
import api from '@/lib/api';

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
  const [activeTab, setActiveTab] = useState('invoice');
  
  // Shipment management state
  const [awbs, setAwbs] = useState<any[]>([]);
  const [searchAWB, setSearchAWB] = useState('');
  const [selectedAWB, setSelectedAWB] = useState<any>(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateLocation, setUpdateLocation] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateDateTime, setUpdateDateTime] = useState('');
  const [isLoadingAWBs, setIsLoadingAWBs] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Branch Locations state
  const [branchLocations, setBranchLocations] = useState<any[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [branchForm, setBranchForm] = useState({
    city: '',
    address: '',
    mobileNumber: '',
    email: '',
    contactPerson: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Listen for navigation to invoice tab
  useEffect(() => {
    const handleNavigateToInvoice = () => {
      setActiveTab('invoice');
    };
    window.addEventListener('navigateToInvoiceTab', handleNavigateToInvoice);
    return () => {
      window.removeEventListener('navigateToInvoiceTab', handleNavigateToInvoice);
    };
  }, []);

  // Branch Locations functions
  const loadBranchLocations = async () => {
    setIsLoadingBranches(true);
    try {
      const data = await api.branchLocations.getAll();
      const branches = data.branches || data || [];
      setBranchLocations(branches);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load branch locations',
        variant: 'destructive',
      });
      // Fallback to localStorage if API fails
      const stored = localStorage.getItem('branchLocations');
      if (stored) {
        setBranchLocations(JSON.parse(stored));
      }
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleSaveBranch = async () => {
    if (!branchForm.city || !branchForm.address || !branchForm.mobileNumber || !branchForm.email || !branchForm.contactPerson) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields including city name',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingBranch) {
        // Update existing
        const updated = await api.branchLocations.update(editingBranch._id, branchForm);
        setBranchLocations(branchLocations.map(b => 
          b._id === editingBranch._id ? updated : b
        ));
        toast({
          title: 'Success',
          description: 'Branch location updated successfully',
          variant: 'success',
        });
      } else {
        // Create new
        const newBranch = await api.branchLocations.create(branchForm);
        setBranchLocations([...branchLocations, newBranch]);
        toast({
          title: 'Success',
          description: 'Branch location added successfully',
          variant: 'success',
        });
      }
      setBranchForm({ city: '', address: '', mobileNumber: '', email: '', contactPerson: '' });
      setEditingBranch(null);
      // Reload to ensure sync
      await loadBranchLocations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save branch location',
        variant: 'destructive',
      });
    }
  };

  const handleEditBranch = (branch: any) => {
    setEditingBranch(branch);
    setBranchForm({
      city: branch.city || '',
      address: branch.address || '',
      mobileNumber: branch.mobileNumber || '',
      email: branch.email || '',
      contactPerson: branch.contactPerson || '',
    });
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch location?')) {
      return;
    }

    try {
      await api.branchLocations.delete(id);
      setBranchLocations(branchLocations.filter(b => b._id !== id));
      toast({
        title: 'Success',
        description: 'Branch location deleted successfully',
        variant: 'success',
      });
      if (editingBranch?._id === id) {
        setEditingBranch(null);
        setBranchForm({ city: '', address: '', mobileNumber: '', email: '', contactPerson: '' });
      }
      // Reload to ensure sync
      await loadBranchLocations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete branch location',
        variant: 'destructive',
      });
    }
  };

  // Load branch locations when tab is active
  useEffect(() => {
    if (activeTab === 'branches') {
      loadBranchLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Load AWBs
  const loadAWBs = async () => {
    setIsLoadingAWBs(true);
    try {
      const response = await api.awb.getAll({ limit: 50, page: 1 });
      setAwbs(response.awbs || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load shipments',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAWBs(false);
    }
  };

  // Search AWB
  const handleSearchAWB = async () => {
    if (!searchAWB.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an AWB number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingAWBs(true);
    try {
      const awb = await api.awb.getByAWBNo(searchAWB.trim());
      setSelectedAWB(awb);
      setUpdateStatus(awb.status || '');
      setUpdateLocation('');
      setUpdateDescription('');
      // Set current date/time as default (format: YYYY-MM-DDTHH:mm for datetime-local)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      setUpdateDateTime(localDateTime);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'AWB not found',
        variant: 'destructive',
      });
      setSelectedAWB(null);
    } finally {
      setIsLoadingAWBs(false);
    }
  };

  // Update shipment status
  const handleUpdateStatus = async () => {
    if (!selectedAWB || !updateStatus) {
      toast({
        title: 'Error',
        description: 'Please select a status',
        variant: 'destructive',
      });
      return;
    }
    
    if (!updateDateTime || !updateDateTime.trim()) {
      toast({
        title: 'Error',
        description: 'Please select a date and time',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Convert datetime-local string to ISO string properly
      // datetime-local gives us "YYYY-MM-DDTHH:mm" in local time
      // We need to treat it as local time and convert to ISO
      let timestampISO;
      if (updateDateTime && updateDateTime.trim()) {
        // Parse the datetime-local string (format: YYYY-MM-DDTHH:mm)
        const [datePart, timePart] = updateDateTime.split('T');
        if (datePart && timePart) {
          const [year, month, day] = datePart.split('-').map(Number);
          const [hours, minutes] = timePart.split(':').map(Number);
          
          // Create a Date object in local time
          const localDate = new Date(year, month - 1, day, hours, minutes || 0);
          
          // Check if date is valid
          if (!isNaN(localDate.getTime())) {
            timestampISO = localDate.toISOString();
            console.log('Converted datetime:', {
              input: updateDateTime,
              output: timestampISO,
              localDate: localDate.toString()
            });
          } else {
            // Fallback to current time if invalid
            console.warn('Invalid date, using current time');
            timestampISO = new Date().toISOString();
          }
        } else {
          timestampISO = new Date().toISOString();
        }
      } else {
        // Use current time if no date/time provided
        timestampISO = new Date().toISOString();
        console.log('No date/time provided, using current time:', timestampISO);
      }
      
      const updateData = {
        status: updateStatus,
        location: updateLocation || undefined,
        description: updateDescription || undefined,
        updatedBy: 'Admin',
        timestamp: timestampISO,
      };
      
      console.log('Sending update request:', updateData);
      
      await api.awb.updateTrackingByAWBNo(selectedAWB.awbNo, updateData);
      
      toast({
        title: 'Success',
        description: 'Shipment status updated successfully',
      });
      
      // Reload AWB data
      const updatedAWB = await api.awb.getByAWBNo(selectedAWB.awbNo);
      setSelectedAWB(updatedAWB);
      setUpdateLocation('');
      setUpdateDescription('');
      // Reset date/time to current
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      setUpdateDateTime(localDateTime);
      
      // Reload AWBs list
      loadAWBs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions = [
    'Couriers',
    'Courier Pickup',
    'Shipped',
    'Intransit',
    'Arrived at Destination',
    'Out for Delivery',
    'Pending Order',
    'Delivered',
  ];

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) {
      return <Badge className="bg-green-500">Delivered</Badge>;
    } else if (statusLower.includes('out for delivery')) {
      return <Badge className="bg-blue-500">Out for Delivery</Badge>;
    } else if (statusLower.includes('intransit') || statusLower.includes('shipped')) {
      return <Badge className="bg-yellow-500">In Transit</Badge>;
    } else if (statusLower.includes('pending')) {
      return <Badge className="bg-gray-500">Pending</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

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
        <Tabs defaultValue="invoice" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
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
              value="branches"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Branch Locations
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
                  Shipment Status Management
                </CardTitle>
                <CardDescription>Update shipment status by AWB number</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Search AWB */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter AWB number (e.g., V100000001)"
                      value={searchAWB}
                      onChange={(e) => setSearchAWB(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchAWB()}
                      className="flex-1"
                    />
                    <Button onClick={handleSearchAWB} disabled={isLoadingAWBs}>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                    <Button onClick={loadAWBs} variant="outline" disabled={isLoadingAWBs}>
                      Load All
                    </Button>
                  </div>

                  {/* Update Status Form */}
                  {selectedAWB && (
                    <Card className="bg-blue-50/50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Update Status: {selectedAWB.awbNo}</CardTitle>
                        <CardDescription>
                          Current Status: {getStatusBadge(selectedAWB.status)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select value={updateStatus} onValueChange={setUpdateStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Location (Optional)</Label>
                          <Input
                            placeholder="Enter location"
                            value={updateLocation}
                            onChange={(e) => setUpdateLocation(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (Optional)</Label>
                          <Input
                            placeholder="Enter description"
                            value={updateDescription}
                            onChange={(e) => setUpdateDescription(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Date & Time *</Label>
                          <Input
                            type="datetime-local"
                            value={updateDateTime}
                            onChange={(e) => {
                              console.log('Date/time changed:', e.target.value);
                              setUpdateDateTime(e.target.value);
                            }}
                            className="w-full"
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Select the date and time for this status update
                          </p>
                        </div>
                        <Button onClick={handleUpdateStatus} disabled={isUpdating || !updateStatus}>
                          <Edit className="mr-2 h-4 w-4" />
                          {isUpdating ? 'Updating...' : 'Update Status'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* AWBs List */}
                  {awbs.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Recent Shipments</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>AWB Number</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Origin</TableHead>
                              <TableHead>Destination</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {awbs.map((awb) => (
                              <TableRow key={awb._id}>
                                <TableCell className="font-mono">{awb.awbNo}</TableCell>
                                <TableCell>{awb.customer}</TableCell>
                                <TableCell>{awb.origin}</TableCell>
                                <TableCell>{awb.destination}</TableCell>
                                <TableCell>{getStatusBadge(awb.status)}</TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSearchAWB(awb.awbNo);
                                      handleSearchAWB();
                                    }}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Update
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
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

          <TabsContent value="branches" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Branch Location Management
                </CardTitle>
                <CardDescription>Add, edit, or delete branch locations</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Add/Edit Form */}
                <Card className="bg-blue-50/50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingBranch ? 'Edit Branch Location' : 'Add New Branch Location'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>City Name *</Label>
                      <Input
                        placeholder="Enter city name (e.g., Jamnagar, Mumbai)"
                        value={branchForm.city}
                        onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address *</Label>
                      <Input
                        placeholder="Enter complete address"
                        value={branchForm.address}
                        onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mobile Number *</Label>
                        <Input
                          placeholder="Enter mobile number"
                          value={branchForm.mobileNumber}
                          onChange={(e) => setBranchForm({ ...branchForm, mobileNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={branchForm.email}
                          onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person *</Label>
                      <Input
                        placeholder="Enter contact person name"
                        value={branchForm.contactPerson}
                        onChange={(e) => setBranchForm({ ...branchForm, contactPerson: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveBranch} className="flex-1">
                        {editingBranch ? 'Update' : 'Add'} Branch
                      </Button>
                      {editingBranch && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditingBranch(null);
                            setBranchForm({ city: '', address: '', mobileNumber: '', email: '', contactPerson: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Branch Locations List */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Existing Branch Locations</h3>
                  {isLoadingBranches ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : branchLocations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No branch locations found</div>
                  ) : (
                    <div className="space-y-4">
                      {branchLocations.map((branch) => (
                        <Card key={branch._id} className="bg-white border-gray-200">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2 flex-1">
                                <div className="mb-2">
                                  <h4 className="font-bold text-lg text-blue-600">{branch.city || 'Branch Location'}</h4>
                                  <p className="text-sm text-gray-500 mt-1">{branch.address}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div>
                                    <strong>Mobile:</strong> {branch.mobileNumber}
                                  </div>
                                  <div>
                                    <strong>Email:</strong> {branch.email}
                                  </div>
                                  <div className="col-span-2">
                                    <strong>Contact Person:</strong> {branch.contactPerson}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditBranch(branch)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteBranch(branch._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
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

