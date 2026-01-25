import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, LogOut, Package, Users, History, Settings, Lock, Eye, EyeOff, Search, Edit, Building2, Trash2, Plus, UserCog, Upload, FileSpreadsheet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import InvoiceEntry from '@/components/InvoiceEntry';
import InvoiceHistory from '@/components/InvoiceHistory';
import api from '@/lib/api';
import { countryCodes, searchCountries, CountryCode } from '@/lib/countryCodes';

const AdminDashboard = () => {
  const { isAuthenticated, logout, changePassword, user, isAdmin, isVendor } = useAuth();
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
  const [updateBookingDate, setUpdateBookingDate] = useState('');
  const [isLoadingAWBs, setIsLoadingAWBs] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingBookingDate, setIsUpdatingBookingDate] = useState(false);
  
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
  
  // Vendor Users state
  const [vendorUsers, setVendorUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    vendorName: '',
    role: 'vendor',
    isActive: true,
  });
  
  // Price Sheets state
  const [priceSheets, setPriceSheets] = useState<any[]>([]);
  const [isLoadingPriceSheets, setIsLoadingPriceSheets] = useState(false);
  const [editingPriceSheet, setEditingPriceSheet] = useState<any>(null);
  const [selectedPriceSheet, setSelectedPriceSheet] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [priceSheetForm, setPriceSheetForm] = useState({
    sheetName: '',
    description: '',
    isDefault: false,
  });
  const [itemForm, setItemForm] = useState({
    itemName: '',
    hsnCode: '',
    weight: '',
    rate: '',
    destination: '',
    country: '',
    countryCode: '',
    serviceType: '',
    currency: 'INR',
  });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<{row: number, field: string} | null>(null);
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDialogFor, setCountryDialogFor] = useState<{row: number, field: string} | null>(null);

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
      const params: any = { limit: 50, page: 1 };
      // If vendor, only show their AWBs
      if (isVendor() && user?._id) {
        params.vendorId = user._id;
        params.userRole = 'vendor';
      } else if (isAdmin()) {
        params.userRole = 'admin';
      }
      const response = await api.awb.getAll(params);
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
      
      // Set booking date from AWB or current date/time
      if (awb.bookingDate) {
        const bookingDate = new Date(awb.bookingDate);
        const bYear = bookingDate.getFullYear();
        const bMonth = String(bookingDate.getMonth() + 1).padStart(2, '0');
        const bDay = String(bookingDate.getDate()).padStart(2, '0');
        const bHours = String(bookingDate.getHours()).padStart(2, '0');
        const bMinutes = String(bookingDate.getMinutes()).padStart(2, '0');
        const bookingDateTime = `${bYear}-${bMonth}-${bDay}T${bHours}:${bMinutes}`;
        setUpdateBookingDate(bookingDateTime);
      } else {
        setUpdateBookingDate(localDateTime);
      }
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

  // Update booking date/time (Admin only)
  const handleUpdateBookingDate = async () => {
    if (!isAdmin()) {
      toast({
        title: 'Access Denied',
        description: 'Only admin can update booking date and time',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedAWB || !updateBookingDate) {
      toast({
        title: 'Error',
        description: 'Please select a booking date and time',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingBookingDate(true);
    try {
      // Convert datetime-local string to ISO string
      const [datePart, timePart] = updateBookingDate.split('T');
      if (datePart && timePart) {
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        
        // Create a Date object in local time
        const localDate = new Date(year, month - 1, day, hours, minutes || 0);
        
        if (!isNaN(localDate.getTime())) {
          const timestampISO = localDate.toISOString();
          
          await api.awb.updateBookingDateByAWBNo(selectedAWB.awbNo, timestampISO, user?.role || 'admin');
          
          toast({
            title: 'Success',
            description: 'Booking date and time updated successfully',
          });
          
          // Reload AWB data
          const updatedAWB = await api.awb.getByAWBNo(selectedAWB.awbNo);
          setSelectedAWB(updatedAWB);
          
          // Update booking date display
          const bDate = new Date(updatedAWB.bookingDate);
          const bYear = bDate.getFullYear();
          const bMonth = String(bDate.getMonth() + 1).padStart(2, '0');
          const bDay = String(bDate.getDate()).padStart(2, '0');
          const bHours = String(bDate.getHours()).padStart(2, '0');
          const bMinutes = String(bDate.getMinutes()).padStart(2, '0');
          const bookingDateTime = `${bYear}-${bMonth}-${bDay}T${bHours}:${bMinutes}`;
          setUpdateBookingDate(bookingDateTime);
          
          // Reload AWBs list
          loadAWBs();
        } else {
          throw new Error('Invalid date format');
        }
      } else {
        throw new Error('Invalid date format');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update booking date',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingBookingDate(false);
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

  // Vendor Users functions
  const loadVendorUsers = async () => {
    if (!isAdmin()) return;
    setIsLoadingUsers(true);
    try {
      const users = await api.users.getAll();
      setVendorUsers(users);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load vendor users',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSaveUser = async () => {
    if (!userForm.username || !userForm.vendorName || (!editingUser && !userForm.password)) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!editingUser && userForm.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingUser) {
        const updateData: any = {
          vendorName: userForm.vendorName,
          isActive: userForm.isActive,
        };
        if (userForm.password) {
          updateData.password = userForm.password;
        }
        await api.users.update(editingUser._id, updateData);
        toast({
          title: 'Success',
          description: 'Vendor user updated successfully',
        });
      } else {
        await api.users.create(userForm);
        toast({
          title: 'Success',
          description: 'Vendor user created successfully',
        });
      }
      setEditingUser(null);
      setUserForm({ username: '', password: '', vendorName: '', role: 'vendor', isActive: true });
      loadVendorUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save vendor user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this vendor user?')) {
      return;
    }

    try {
      await api.users.delete(userId);
      toast({
        title: 'Success',
        description: 'Vendor user deleted successfully',
      });
      loadVendorUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete vendor user',
        variant: 'destructive',
      });
    }
  };

  // Price Sheets functions
  const loadPriceSheets = async () => {
    if (!isAdmin()) return;
    setIsLoadingPriceSheets(true);
    try {
      const sheets = await api.priceSheets.getAll();
      setPriceSheets(sheets);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load price sheets',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPriceSheets(false);
    }
  };

  const handleUploadPriceSheet = async () => {
    if (!uploadFile) {
      toast({
        title: 'Error',
        description: 'Please select an Excel file',
        variant: 'destructive',
      });
      return;
    }

    if (!priceSheetForm.sheetName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a sheet name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('sheetName', priceSheetForm.sheetName);
      formData.append('description', priceSheetForm.description);
      formData.append('isDefault', priceSheetForm.isDefault.toString());
      if (user?._id) {
        formData.append('uploadedBy', user._id);
      }

      await api.priceSheets.upload(formData);
      
      toast({
        title: 'Success',
        description: 'Price sheet uploaded successfully',
      });
      
      setUploadFile(null);
      setPriceSheetForm({ sheetName: '', description: '', isDefault: false });
      loadPriceSheets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload price sheet',
        variant: 'destructive',
      });
    }
  };

  const handleCreatePriceSheet = async () => {
    if (!priceSheetForm.sheetName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a sheet name',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.priceSheets.create({
        sheetName: priceSheetForm.sheetName,
        description: priceSheetForm.description,
        isDefault: priceSheetForm.isDefault,
        uploadedBy: user?._id
      });
      
      toast({
        title: 'Success',
        description: 'Price sheet created successfully',
      });
      
      setPriceSheetForm({ sheetName: '', description: '', isDefault: false });
      loadPriceSheets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create price sheet',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePriceSheet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price sheet?')) {
      return;
    }

    try {
      await api.priceSheets.delete(id);
      toast({
        title: 'Success',
        description: 'Price sheet deleted successfully',
      });
      loadPriceSheets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete price sheet',
        variant: 'destructive',
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.priceSheets.update(id, { isDefault: true });
      toast({
        title: 'Success',
        description: 'Default price sheet updated',
      });
      loadPriceSheets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update default price sheet',
        variant: 'destructive',
      });
    }
  };

  const handleAddItem = async (sheetId: string) => {
    if (!itemForm.itemName || !itemForm.rate) {
      toast({
        title: 'Error',
        description: 'Item name and rate are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.priceSheets.addItem(sheetId, {
        ...itemForm,
        rate: parseFloat(itemForm.rate) || 0
      });
      
      toast({
        title: 'Success',
        description: 'Item added successfully',
      });
      
      setItemForm({
        itemName: '',
        hsnCode: '',
        weight: '',
        rate: '',
        destination: '',
        country: '',
        countryCode: '',
        serviceType: '',
        currency: 'INR',
      });
      loadPriceSheets();
      if (selectedPriceSheet?._id === sheetId) {
        const updated = await api.priceSheets.getById(sheetId);
        setSelectedPriceSheet(updated);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add item',
        variant: 'destructive',
      });
    }
  };

  const handleEditItem = async (sheetId: string, itemId: string) => {
    if (!itemForm.itemName || !itemForm.rate) {
      toast({
        title: 'Error',
        description: 'Item name and rate are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.priceSheets.updateItem(sheetId, itemId, {
        ...itemForm,
        rate: parseFloat(itemForm.rate) || 0
      });
      
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
      
      setEditingItem(null);
      setItemForm({
        itemName: '',
        hsnCode: '',
        weight: '',
        rate: '',
        destination: '',
        country: '',
        countryCode: '',
        serviceType: '',
        currency: 'INR',
      });
      loadPriceSheets();
      if (selectedPriceSheet?._id === sheetId) {
        const updated = await api.priceSheets.getById(sheetId);
        setSelectedPriceSheet(updated);
        setEditedItems([...updated.items]);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update item',
        variant: 'destructive',
      });
    }
  };

  const handleCellEdit = (rowIndex: number, field: string, value: any) => {
    const updated = [...editedItems];
    updated[rowIndex] = { ...updated[rowIndex], [field]: value };
    setEditedItems(updated);
  };

  const handleSaveRow = async (rowIndex: number) => {
    const item = editedItems[rowIndex];
    if (!item.itemName || !item.rate) {
      toast({
        title: 'Error',
        description: 'Item name and rate are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.priceSheets.updateItem(selectedPriceSheet._id, item._id, {
        itemName: item.itemName,
        hsnCode: item.hsnCode || '',
        weight: item.weight || '',
        rate: parseFloat(item.rate?.toString() || '0'),
        destination: item.destination || '',
        country: item.country || '',
        countryCode: item.countryCode || '',
        serviceType: item.serviceType || '',
        currency: item.currency || 'INR'
      });
      
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
      
      setEditingCell(null);
      // Reload to get fresh data
      const updated = await api.priceSheets.getById(selectedPriceSheet._id);
      setSelectedPriceSheet(updated);
      setEditedItems([...updated.items]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update item',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (sheetId: string, itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await api.priceSheets.deleteItem(sheetId, itemId);
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
      loadPriceSheets();
      if (selectedPriceSheet?._id === sheetId) {
        const updated = await api.priceSheets.getById(sheetId);
        setSelectedPriceSheet(updated);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  const selectCountry = (country: CountryCode) => {
    if (countryDialogFor) {
      // Update country in editable table
      handleCellEdit(countryDialogFor.row, 'country', country.name);
      handleCellEdit(countryDialogFor.row, 'countryCode', country.code);
      setCountryDialogFor(null);
    } else {
      // Update country in form
      setItemForm({ ...itemForm, country: country.name, countryCode: country.code });
    }
    setShowCountryDialog(false);
    setCountrySearch('');
  };

  const countryResults = searchCountries(countrySearch);

  useEffect(() => {
    if (isAdmin() && activeTab === 'users') {
      loadVendorUsers();
    }
    if (isAdmin() && activeTab === 'price-sheets') {
      loadPriceSheets();
    }
  }, [activeTab, isAdmin]);

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
            {isAdmin() && (
              <TabsTrigger 
                value="price-sheets"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Price Sheets
              </TabsTrigger>
            )}
            {isAdmin() && (
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all"
              >
                <UserCog className="mr-2 h-4 w-4" />
                Vendor Users
              </TabsTrigger>
            )}
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

                  {/* Update Booking Date Form (Admin only) */}
                  {selectedAWB && isAdmin() && (
                    <Card className="bg-green-50/50 border-green-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Update Booking Date & Time: {selectedAWB.awbNo}</CardTitle>
                        <CardDescription>
                          Current Booking Date: {selectedAWB.bookingDate 
                            ? new Date(selectedAWB.bookingDate).toLocaleString('en-IN', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })
                            : 'Not set'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Booking Date & Time *</Label>
                          <Input
                            type="datetime-local"
                            value={updateBookingDate}
                            onChange={(e) => {
                              setUpdateBookingDate(e.target.value);
                            }}
                            className="w-full"
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Select the booking date and time for this AWB
                          </p>
                        </div>
                        <Button 
                          onClick={handleUpdateBookingDate} 
                          disabled={isUpdatingBookingDate || !updateBookingDate}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {isUpdatingBookingDate ? 'Updating...' : 'Update Booking Date'}
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

          {/* Price Sheets Tab (Admin only) */}
          {isAdmin() && (
            <TabsContent value="price-sheets" className="space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                    Price Sheet Management
                  </CardTitle>
                  <CardDescription>Upload and manage rate charts from Excel files</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Create New Price Sheet Form */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Create New Price Sheet</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Sheet Name *</Label>
                          <Input
                            placeholder="Enter price sheet name"
                            value={priceSheetForm.sheetName}
                            onChange={(e) => setPriceSheetForm({ ...priceSheetForm, sheetName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            placeholder="Enter description (optional)"
                            value={priceSheetForm.description}
                            onChange={(e) => setPriceSheetForm({ ...priceSheetForm, description: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Set as Default</Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={priceSheetForm.isDefault}
                              onChange={(e) => setPriceSheetForm({ ...priceSheetForm, isDefault: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-muted-foreground">Make this the default price sheet</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={handleCreatePriceSheet} 
                        disabled={!priceSheetForm.sheetName} 
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Price Sheet
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Create a new price sheet and add items manually using the editable table
                      </p>
                    </CardContent>
                  </Card>

                  {/* Price Sheets List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Price Sheets</h3>
                    {isLoadingPriceSheets ? (
                      <div className="text-center py-8">Loading...</div>
                    ) : priceSheets.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No price sheets found. Upload your first price sheet above.</div>
                    ) : (
                      <div className="space-y-4">
                        {priceSheets.map((sheet) => (
                          <Card key={sheet._id} className="bg-white border-gray-200">
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                  <div className="mb-2">
                                    <h4 className="font-bold text-lg text-blue-600">{sheet.sheetName}</h4>
                                    {sheet.description && (
                                      <p className="text-sm text-gray-500 mt-1">{sheet.description}</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                      Uploaded: {new Date(sheet.createdAt).toLocaleDateString()} | 
                                      Items: {sheet.items?.length || 0}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    {sheet.isDefault && (
                                      <Badge className="bg-green-500">Default</Badge>
                                    )}
                                    {sheet.isActive ? (
                                      <Badge className="bg-blue-500">Active</Badge>
                                    ) : (
                                      <Badge className="bg-gray-500">Inactive</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      const sheetData = await api.priceSheets.getById(sheet._id);
                                      setSelectedPriceSheet(sheetData);
                                      setEditedItems([...sheetData.items]);
                                      setEditingItem(null);
                                      setEditingItemIndex(null);
                                      setEditingCell(null);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Manage Items
                                  </Button>
                                  {!sheet.isDefault && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSetDefault(sheet._id)}
                                    >
                                      Set Default
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeletePriceSheet(sheet._id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Price Sheet - Item Management */}
                  {selectedPriceSheet && (
                    <Card className="bg-blue-50/50 border-blue-200 mt-6">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            Manage Items: {selectedPriceSheet.sheetName}
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPriceSheet(null);
                              setEditingItem(null);
                              setEditingItemIndex(null);
                              setEditedItems([]);
                              setItemForm({
                                itemName: '',
                                hsnCode: '',
                                weight: '',
                                rate: '',
                                destination: '',
                                country: '',
                                countryCode: '',
                                serviceType: '',
                                currency: 'INR',
                              });
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Add New Item Form */}
                        <Card className="bg-white border-gray-200">
                          <CardHeader>
                            <CardTitle className="text-lg">Add New Item</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Item Name *</Label>
                                <Input
                                  placeholder="Enter item name"
                                  value={itemForm.itemName}
                                  onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>HSN Code</Label>
                                <Input
                                  placeholder="Enter HSN code"
                                  value={itemForm.hsnCode}
                                  onChange={(e) => setItemForm({ ...itemForm, hsnCode: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Weight</Label>
                                <Input
                                  placeholder="e.g., 1kg, 500g"
                                  value={itemForm.weight}
                                  onChange={(e) => setItemForm({ ...itemForm, weight: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Rate (₹) *</Label>
                                <Input
                                  type="number"
                                  placeholder="Enter rate"
                                  value={itemForm.rate}
                                  onChange={(e) => setItemForm({ ...itemForm, rate: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Country</Label>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Select country"
                                    value={itemForm.country}
                                    readOnly
                                    onClick={() => setShowCountryDialog(true)}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCountryDialog(true)}
                                  >
                                    Select
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Destination</Label>
                                <Input
                                  placeholder="Enter destination city"
                                  value={itemForm.destination}
                                  onChange={(e) => setItemForm({ ...itemForm, destination: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Service Type</Label>
                                <Input
                                  placeholder="e.g., Express, Standard"
                                  value={itemForm.serviceType}
                                  onChange={(e) => setItemForm({ ...itemForm, serviceType: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select
                                  value={itemForm.currency}
                                  onValueChange={(value) => setItemForm({ ...itemForm, currency: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="INR">INR (₹)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleAddItem(selectedPriceSheet._id)}
                              disabled={!itemForm.itemName || !itemForm.rate}
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Item
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Editable Items Table */}
                        <div>
                          <h4 className="font-semibold mb-4">Items ({editedItems.length || selectedPriceSheet.items?.length || 0})</h4>
                          {editedItems.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden">
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-gray-50">
                                      <TableHead className="w-[200px]">Item Name</TableHead>
                                      <TableHead className="w-[100px]">HSN</TableHead>
                                      <TableHead className="w-[100px]">Weight</TableHead>
                                      <TableHead className="w-[150px]">Country</TableHead>
                                      <TableHead className="w-[150px]">Destination</TableHead>
                                      <TableHead className="w-[120px]">Service</TableHead>
                                      <TableHead className="w-[120px] text-right">Rate</TableHead>
                                      <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {editedItems.map((item: any, index: number) => (
                                      <TableRow key={item._id || index} className="hover:bg-gray-50">
                                        <TableCell>
                                          <Input
                                            value={item.itemName || ''}
                                            onChange={(e) => handleCellEdit(index, 'itemName', e.target.value)}
                                            className="h-8 text-sm"
                                            onBlur={() => handleSaveRow(index)}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            value={item.hsnCode || ''}
                                            onChange={(e) => handleCellEdit(index, 'hsnCode', e.target.value)}
                                            className="h-8 text-sm"
                                            onBlur={() => handleSaveRow(index)}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            value={item.weight || ''}
                                            onChange={(e) => handleCellEdit(index, 'weight', e.target.value)}
                                            className="h-8 text-sm"
                                            onBlur={() => handleSaveRow(index)}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex gap-1">
                                            <Input
                                              value={item.country || ''}
                                              readOnly
                                              className="h-8 text-sm flex-1"
                                              onClick={() => {
                                                setCountryDialogFor({ row: index, field: 'country' });
                                                setShowCountryDialog(true);
                                              }}
                                            />
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-8 px-2"
                                              onClick={() => {
                                                setCountryDialogFor({ row: index, field: 'country' });
                                                setShowCountryDialog(true);
                                              }}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            value={item.destination || ''}
                                            onChange={(e) => handleCellEdit(index, 'destination', e.target.value)}
                                            className="h-8 text-sm"
                                            onBlur={() => handleSaveRow(index)}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            value={item.serviceType || ''}
                                            onChange={(e) => handleCellEdit(index, 'serviceType', e.target.value)}
                                            className="h-8 text-sm"
                                            onBlur={() => handleSaveRow(index)}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-1 justify-end">
                                            <span className="text-xs text-gray-500">{item.currency || 'INR'}</span>
                                            <Input
                                              type="number"
                                              value={item.rate || 0}
                                              onChange={(e) => handleCellEdit(index, 'rate', parseFloat(e.target.value) || 0)}
                                              className="h-8 text-sm w-20 text-right font-bold"
                                              onBlur={() => handleSaveRow(index)}
                                            />
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handleSaveRow(index)}
                                              className="h-8 px-2"
                                              title="Save changes"
                                            >
                                              <Edit className="h-3 w-3 text-green-600" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => handleDeleteItem(selectedPriceSheet._id, item._id)}
                                              className="h-8 px-2"
                                              title="Delete item"
                                            >
                                              <Trash2 className="h-3 w-3 text-red-600" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ) : selectedPriceSheet.items && selectedPriceSheet.items.length > 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              Loading items...
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No items found. Add your first item above.
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Country Selection Dialog */}
                  <Dialog open={showCountryDialog} onOpenChange={setShowCountryDialog}>
                    <DialogContent className="max-w-3xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Select Country</DialogTitle>
                        <DialogDescription>
                          Search and select a country for the price item
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Search country..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                        />
                        <ScrollArea className="h-[400px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Country Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {countryResults.length > 0 ? (
                                countryResults.map((country, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{country.name}</TableCell>
                                    <TableCell>{country.code}</TableCell>
                                    <TableCell>
                                      <Button size="sm" onClick={() => selectCountry(country)}>
                                        Select
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                                    No countries found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Vendor Users Tab (Admin only) */}
          {isAdmin() && (
            <TabsContent value="users" className="space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Vendor User Management
                  </CardTitle>
                  <CardDescription>Create and manage vendor user accounts</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Add/Edit User Form */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {editingUser ? 'Edit Vendor User' : 'Create New Vendor User'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Username *</Label>
                          <Input
                            placeholder="Enter username"
                            value={userForm.username}
                            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                            disabled={!!editingUser}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Vendor Name *</Label>
                          <Input
                            placeholder="Enter vendor name"
                            value={userForm.vendorName}
                            onChange={(e) => setUserForm({ ...userForm, vendorName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Password {editingUser ? '(leave blank to keep current)' : '*'}</Label>
                          <Input
                            type="password"
                            placeholder={editingUser ? "Enter new password (optional)" : "Enter password (min 6 characters)"}
                            value={userForm.password}
                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select 
                            value={userForm.isActive ? 'active' : 'inactive'} 
                            onValueChange={(value) => setUserForm({ ...userForm, isActive: value === 'active' })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveUser} className="flex-1">
                          {editingUser ? 'Update' : 'Create'} User
                        </Button>
                        {editingUser && (
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setEditingUser(null);
                              setUserForm({ username: '', password: '', vendorName: '', role: 'vendor', isActive: true });
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Users List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Vendor Users</h3>
                    {isLoadingUsers ? (
                      <div className="text-center py-8">Loading...</div>
                    ) : vendorUsers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No vendor users found</div>
                    ) : (
                      <div className="space-y-4">
                        {vendorUsers.map((vendorUser) => (
                          <Card key={vendorUser._id} className="bg-white border-gray-200">
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                  <div className="mb-2">
                                    <h4 className="font-bold text-lg text-blue-600">{vendorUser.vendorName}</h4>
                                    <p className="text-sm text-gray-500 mt-1">Username: {vendorUser.username}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge className={vendorUser.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}>
                                      {vendorUser.role}
                                    </Badge>
                                    <Badge className={vendorUser.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                                      {vendorUser.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingUser(vendorUser);
                                      setUserForm({
                                        username: vendorUser.username,
                                        password: '',
                                        vendorName: vendorUser.vendorName,
                                        role: vendorUser.role,
                                        isActive: vendorUser.isActive,
                                      });
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  {vendorUser.role !== 'admin' && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeleteUser(vendorUser._id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Delete
                                    </Button>
                                  )}
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
          )}

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

