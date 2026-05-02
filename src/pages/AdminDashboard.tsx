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
import { FileText, LogOut, Package, Users, History, Settings, Lock, Eye, EyeOff, Search, Edit, Building2, Trash2, Plus, UserCog, Upload, FileSpreadsheet, Image as ImageIcon, Video, Youtube, Link as LinkIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import InvoiceEntry from '@/components/InvoiceEntry';
import InvoiceHistory from '@/components/InvoiceHistory';
import Pricing from '@/pages/Pricing';
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
    assignedVendors: [] as string[],
  });
  const [editingVendorAssignment, setEditingVendorAssignment] = useState<any>(null);
  const [vendorAssignmentForm, setVendorAssignmentForm] = useState<string[]>([]);
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
  
  // Gallery state
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    type: 'image' as 'image' | 'video' | 'youtube' | 'imageUrl',
    url: '',
    title: '',
    description: '',
  });
  const [galleryUploadFile, setGalleryUploadFile] = useState<File | null>(null);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<any>(null);

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
      setPriceSheetForm({ sheetName: '', description: '', isDefault: false, assignedVendors: [] });
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
      // Only send uploadedBy if it's a valid MongoDB ObjectId (24 hex characters)
      const isValidObjectId = user?._id && /^[0-9a-fA-F]{24}$/.test(user._id);
      
      await api.priceSheets.create({
        sheetName: priceSheetForm.sheetName,
        description: priceSheetForm.description,
        isDefault: priceSheetForm.isDefault,
        isPublic: (priceSheetForm as any).isPublic || false,
        uploadedBy: isValidObjectId ? user._id : undefined,
        assignedVendors: priceSheetForm.assignedVendors
      });
      
      toast({
        title: 'Success',
        description: 'Price sheet created successfully',
      });
      
      setPriceSheetForm({ sheetName: '', description: '', isDefault: false, assignedVendors: [] });
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

  const handleSaveVendorAssignment = async () => {
    if (!editingVendorAssignment) return;

    try {
      await api.priceSheets.update(editingVendorAssignment._id, {
        assignedVendors: vendorAssignmentForm
      });
      
      toast({
        title: 'Success',
        description: 'Vendor assignment updated successfully',
      });
      
      setEditingVendorAssignment(null);
      setVendorAssignmentForm([]);
      loadPriceSheets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update vendor assignment',
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
        setEditedItems([...updated.items]);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  const selectCountry = async (country: CountryCode) => {
    if (countryDialogFor) {
      // Update country in editable table immediately
      const updated = [...editedItems];
      updated[countryDialogFor.row] = { 
        ...updated[countryDialogFor.row], 
        country: country.name,
        countryCode: country.code
      };
      setEditedItems(updated);
      
      // Now save with the updated country value
      const item = updated[countryDialogFor.row];
      if (item && item.itemName && item.rate) {
        try {
          await api.priceSheets.updateItem(selectedPriceSheet._id, item._id, {
            itemName: item.itemName,
            hsnCode: item.hsnCode || '',
            weight: item.weight || '',
            rate: parseFloat(item.rate?.toString() || '0'),
            destination: item.destination || '',
            country: country.name, // Use the selected country directly
            countryCode: country.code, // Use the selected country code directly
            serviceType: item.serviceType || '',
            currency: item.currency || 'INR'
          });
          
          toast({
            title: 'Success',
            description: 'Country updated successfully',
          });
          
          // Reload to get fresh data
          const updatedSheet = await api.priceSheets.getById(selectedPriceSheet._id);
          setSelectedPriceSheet(updatedSheet);
          setEditedItems([...updatedSheet.items]);
        } catch (error: any) {
          toast({
            title: 'Error',
            description: error.message || 'Failed to update country',
            variant: 'destructive',
          });
        }
      }
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
      loadVendorUsers(); // Load vendors for assignment dropdown
    }
    if (isAdmin() && activeTab === 'gallery') {
      loadGalleryItems();
    }
  }, [activeTab, isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Gallery functions
  const loadGalleryItems = async () => {
    setIsLoadingGallery(true);
    try {
      // Only load gallery category items, exclude pricing images
      const data = await api.gallery.getAll({ category: 'gallery' });
      setGalleryItems(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load gallery items',
        variant: 'destructive',
      });
      setGalleryItems([]);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleGalleryUpload = async () => {
    if (!galleryUploadFile && galleryForm.type !== 'youtube' && galleryForm.type !== 'imageUrl') {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    if ((galleryForm.type === 'youtube' || galleryForm.type === 'imageUrl') && !galleryForm.url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (galleryForm.type === 'youtube' || galleryForm.type === 'imageUrl') {
        // Create item with URL - mark as gallery category
        const itemData = {
          type: galleryForm.type,
          url: galleryForm.url.trim(),
          title: galleryForm.title.trim() || undefined,
          description: galleryForm.description.trim() || undefined,
          category: 'gallery', // Mark as gallery item
        };
        
        if (editingGalleryItem) {
          await api.gallery.update(editingGalleryItem._id, itemData);
          toast({
            title: 'Success',
            description: 'Gallery item updated successfully',
          });
        } else {
          await api.gallery.create(itemData);
          toast({
            title: 'Success',
            description: 'Gallery item added successfully',
          });
        }
      } else {
        // Upload file - mark as gallery category
        const formData = new FormData();
        formData.append('file', galleryUploadFile!);
        formData.append('type', galleryForm.type);
        formData.append('category', 'gallery'); // Mark as gallery item
        if (galleryForm.title.trim()) formData.append('title', galleryForm.title.trim());
        if (galleryForm.description.trim()) formData.append('description', galleryForm.description.trim());
        
        if (editingGalleryItem) {
          formData.append('_id', editingGalleryItem._id);
          await api.gallery.upload(formData);
          toast({
            title: 'Success',
            description: 'Gallery item updated successfully',
          });
        } else {
          await api.gallery.upload(formData);
          toast({
            title: 'Success',
            description: 'Gallery item uploaded successfully',
          });
        }
      }
      
      setShowGalleryDialog(false);
      setGalleryForm({ type: 'image', url: '', title: '', description: '' });
      setGalleryUploadFile(null);
      setEditingGalleryItem(null);
      loadGalleryItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save gallery item',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) {
      return;
    }

    try {
      await api.gallery.delete(id);
      toast({
        title: 'Success',
        description: 'Gallery item deleted successfully',
      });
      loadGalleryItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete gallery item',
        variant: 'destructive',
      });
    }
  };

  const handleEditGalleryItem = (item: any) => {
    setEditingGalleryItem(item);
    setGalleryForm({
      type: item.type,
      url: item.url || '',
      title: item.title || '',
      description: item.description || '',
    });
    setShowGalleryDialog(true);
  };

  const handleNewGalleryItem = () => {
    setEditingGalleryItem(null);
    setGalleryForm({ type: 'image', url: '', title: '', description: '' });
    setGalleryUploadFile(null);
    setShowGalleryDialog(true);
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
        <div className="container mx-auto px-4 py-3 md:py-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                  {isVendor() ? 'Vendor Dashboard' : 'Admin Dashboard'}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 hidden sm:block">Visakha International Couriers</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              {/* Account Details for Vendors */}
              {isVendor() && user && (
                <Card className="bg-blue-50 border-blue-200 hidden md:block">
                  <CardContent className="py-2 px-3">
                    <div className="flex items-center gap-3 text-xs md:text-sm">
                      <div>
                        <span className="text-muted-foreground">Account:</span>
                        <span className="font-semibold ml-1">{user.username}</span>
                      </div>
                      <div className="hidden lg:block">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-semibold ml-1">{user.vendorName}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                size="sm"
                className="border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <Tabs defaultValue="invoice" className="space-y-4 md:space-y-6" value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-1">
          <TabsList className="bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200 p-1 md:p-1.5 rounded-lg flex-nowrap inline-flex min-w-full md:min-w-0 w-max md:w-auto">
            <TabsTrigger
              value="invoice"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
            >
              <FileText className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              Invoice Entry
            </TabsTrigger>
            <TabsTrigger
              value="shipments"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
            >
              <Package className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              Shipments
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
            >
              <History className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              History
            </TabsTrigger>
            {isAdmin() && (
              <TabsTrigger
                value="customers"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
              >
                <Users className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                Customers
              </TabsTrigger>
            )}
            {isAdmin() && (
              <TabsTrigger
                value="branches"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
              >
                <Building2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                Branches
              </TabsTrigger>
            )}
            {isAdmin() && (
              <TabsTrigger
                value="price-sheets"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
              >
                <FileSpreadsheet className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                Price Sheets
              </TabsTrigger>
            )}
            {isVendor() && (
              <TabsTrigger
                value="pricing"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
              >
                <FileSpreadsheet className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                Pricing
              </TabsTrigger>
            )}
            {isAdmin() && (
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
              >
                <UserCog className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                Users
              </TabsTrigger>
            )}
            {isAdmin() && (
              <TabsTrigger
                value="gallery"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
              >
                <ImageIcon className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                Gallery
              </TabsTrigger>
            )}
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
            >
              <Settings className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          </div>

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

          {isAdmin() && (
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
          )}

          {isAdmin() && (
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
          )}

          {/* Price Sheets Tab (Admin only) */}
          {isAdmin() && (
            <TabsContent value="price-sheets" className="space-y-6">
              {/* Page Header */}
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Price Sheet Management</h2>
                  <p className="text-blue-100 text-sm mt-0.5">Create sheets, add country rates, and publish to website</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* LEFT: Create Form */}
                <div className="xl:col-span-2">
                  <Card className="border-0 shadow-md overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b pb-4">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Plus className="h-4 w-4 text-blue-600" />
                        Create New Price Sheet
                      </CardTitle>
                      <CardDescription className="text-xs">Add a sheet then manage its items</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Sheet Name *</Label>
                        <Input
                          placeholder="e.g. USA Rates 2025"
                          value={priceSheetForm.sheetName}
                          onChange={(e) => setPriceSheetForm({ ...priceSheetForm, sheetName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Description</Label>
                        <Input
                          placeholder="Optional note about this sheet"
                          value={priceSheetForm.description}
                          onChange={(e) => setPriceSheetForm({ ...priceSheetForm, description: e.target.value })}
                        />
                      </div>

                      {/* Toggles */}
                      <div className="space-y-3 pt-1">
                        <label className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-green-800">Default Sheet</p>
                            <p className="text-xs text-green-600">For vendors without specific assignment</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={priceSheetForm.isDefault}
                            onChange={(e) => setPriceSheetForm({ ...priceSheetForm, isDefault: e.target.checked })}
                            className="w-4 h-4 accent-green-600"
                          />
                        </label>
                        <label className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-purple-800">Show on Website</p>
                            <p className="text-xs text-purple-600">Visible to customers on pricing page</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={(priceSheetForm as any).isPublic || false}
                            onChange={(e) => setPriceSheetForm({ ...priceSheetForm, isPublic: e.target.checked } as any)}
                            className="w-4 h-4 accent-purple-600"
                          />
                        </label>
                      </div>

                      {/* Assign Vendors */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Assign to Vendors</Label>
                        <ScrollArea className="h-28 border rounded-lg bg-gray-50 p-2">
                          {vendorUsers.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">No vendors available</p>
                          ) : (
                            <div className="space-y-1">
                              {vendorUsers.map((vendor) => (
                                <label key={vendor._id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={priceSheetForm.assignedVendors.includes(vendor._id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setPriceSheetForm({ ...priceSheetForm, assignedVendors: [...priceSheetForm.assignedVendors, vendor._id] });
                                      } else {
                                        setPriceSheetForm({ ...priceSheetForm, assignedVendors: priceSheetForm.assignedVendors.filter(id => id !== vendor._id) });
                                      }
                                    }}
                                    className="w-4 h-4 accent-blue-600"
                                  />
                                  <span className="text-sm">{vendor.vendorName || vendor.username}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                        <p className="text-xs text-muted-foreground">Leave empty = available to all vendors</p>
                      </div>

                      <Button
                        onClick={handleCreatePriceSheet}
                        disabled={!priceSheetForm.sheetName}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Price Sheet
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* RIGHT: Price Sheets List */}
                <div className="xl:col-span-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-800">
                      Your Price Sheets
                      {priceSheets.length > 0 && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {priceSheets.length}
                        </span>
                      )}
                    </h3>
                  </div>

                  {isLoadingPriceSheets ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <div className="text-center space-y-2">
                        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
                        <p className="text-sm">Loading sheets...</p>
                      </div>
                    </div>
                  ) : priceSheets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                      <FileSpreadsheet className="h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm font-medium text-gray-500">No price sheets yet</p>
                      <p className="text-xs text-gray-400 mt-1">Create your first sheet using the form</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {priceSheets.map((sheet) => {
                        const countries = [...new Set((sheet.items || []).map((i: any) => i.country).filter(Boolean))];
                        return (
                          <Card key={sheet._id} className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${sheet.isPublic ? 'border-l-purple-500' : sheet.isDefault ? 'border-l-green-500' : 'border-l-blue-400'}`}>
                            <CardContent className="p-4">
                              {/* Top row: name + badges */}
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="min-w-0">
                                  <h4 className="font-bold text-gray-900 truncate">{sheet.sheetName}</h4>
                                  {sheet.description && (
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{sheet.description}</p>
                                  )}
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                                  {sheet.isPublic && <Badge className="bg-purple-500 text-white text-xs px-2">🌐 Public</Badge>}
                                  {sheet.isDefault && <Badge className="bg-green-500 text-white text-xs px-2">⭐ Default</Badge>}
                                  <Badge className={`text-xs px-2 ${sheet.isActive ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'}`}>
                                    {sheet.isActive ? '● Active' : '○ Inactive'}
                                  </Badge>
                                </div>
                              </div>

                              {/* Stats row */}
                              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {sheet.items?.length || 0} items
                                </span>
                                {countries.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <span>🌍</span>
                                    {countries.slice(0, 3).join(', ')}{countries.length > 3 ? ` +${countries.length - 3}` : ''}
                                  </span>
                                )}
                                <span>{new Date(sheet.createdAt).toLocaleDateString('en-IN')}</span>
                              </div>

                              {/* Vendors */}
                              <div className="mb-3">
                                {sheet.assignedVendors && sheet.assignedVendors.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {sheet.assignedVendors.map((vendor: any) => (
                                      <Badge key={vendor._id || vendor} variant="outline" className="text-xs border-blue-200 text-blue-700">
                                        {vendor.vendorName || vendor.username || vendor}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">All vendors</span>
                                )}
                              </div>

                              {/* Action buttons */}
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs px-3"
                                  onClick={async () => {
                                    const sheetData = await api.priceSheets.getById(sheet._id);
                                    setSelectedPriceSheet(sheetData);
                                    setEditedItems([...sheetData.items]);
                                    setEditingItem(null);
                                    setEditingItemIndex(null);
                                    setEditingCell(null);
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Manage Items
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-3 border-slate-300"
                                  onClick={() => {
                                    const assignedIds = sheet.assignedVendors?.map((v: any) => v._id || v) || [];
                                    setEditingVendorAssignment(sheet);
                                    setVendorAssignmentForm(assignedIds);
                                  }}
                                >
                                  <UserCog className="h-3 w-3 mr-1" />
                                  Vendors
                                </Button>
                                {!sheet.isDefault && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs px-3 border-green-300 text-green-700 hover:bg-green-50"
                                    onClick={() => handleSetDefault(sheet._id)}
                                  >
                                    ⭐ Set Default
                                  </Button>
                                )}
                                {sheet.assignedVendors && sheet.assignedVendors.length > 0 ? (
                                  <span className="h-7 text-xs px-3 flex items-center text-gray-400 italic">
                                    🔒 Vendor-only
                                  </span>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className={`h-7 text-xs px-3 ${sheet.isPublic ? 'border-purple-300 text-purple-700 bg-purple-50' : 'border-purple-300 text-purple-700 hover:bg-purple-50'}`}
                                    onClick={async () => {
                                      await api.priceSheets.update(sheet._id, { isPublic: !sheet.isPublic });
                                      toast({ title: 'Success', description: sheet.isPublic ? 'Removed from public website' : 'Now visible on public website' });
                                      loadPriceSheets();
                                    }}
                                  >
                                    🌐 {sheet.isPublic ? 'Unpublish' : 'Publish'}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-3 border-red-200 text-red-600 hover:bg-red-50 ml-auto"
                                  onClick={() => handleDeletePriceSheet(sheet._id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

                  {/* Vendor Assignment Dialog */}
                  <Dialog open={!!editingVendorAssignment} onOpenChange={(open) => {
                    if (!open) {
                      setEditingVendorAssignment(null);
                      setVendorAssignmentForm([]);
                    }
                  }}>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Assign Vendors to Price Sheet</DialogTitle>
                        <DialogDescription>
                          Select vendors who should have access to "{editingVendorAssignment?.sheetName}". 
                          Leave empty to make it available to all vendors.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <ScrollArea className="h-64 border rounded-md p-4">
                          {vendorUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No vendors available</p>
                          ) : (
                            <div className="space-y-2">
                              {vendorUsers.map((vendor) => (
                                <div key={vendor._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                                  <input
                                    type="checkbox"
                                    checked={vendorAssignmentForm.includes(vendor._id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setVendorAssignmentForm([...vendorAssignmentForm, vendor._id]);
                                      } else {
                                        setVendorAssignmentForm(vendorAssignmentForm.filter(id => id !== vendor._id));
                                      }
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm flex-1">{vendor.vendorName || vendor.username}</span>
                                  {vendorAssignmentForm.includes(vendor._id) && (
                                    <Badge variant="outline" className="text-xs">Assigned</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingVendorAssignment(null);
                              setVendorAssignmentForm([]);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveVendorAssignment}
                          >
                            Save Assignment
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Pricing Images Management for Public Website */}
                  <Card className="border-0 shadow-md overflow-hidden mt-6">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-white">Pricing Images for Website</CardTitle>
                          <CardDescription className="text-purple-100 text-xs mt-0.5">
                            Upload images shown in the carousel on the public pricing page
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Upload Type *</Label>
                          <Select
                            value={galleryForm.type}
                            onValueChange={(value: 'image' | 'imageUrl' | 'youtube' | 'video') => {
                              setGalleryForm({ ...galleryForm, type: value, url: '' });
                              setGalleryUploadFile(null);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select upload type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="image">Upload Image File</SelectItem>
                              <SelectItem value="imageUrl">Image URL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {galleryForm.type === 'image' && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Image File *</Label>
                            <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center hover:border-purple-400 transition-colors cursor-pointer" onClick={() => document.getElementById('pricing-img-input')?.click()}>
                              {galleryUploadFile ? (
                                <div className="flex items-center justify-center gap-2 text-sm text-purple-700">
                                  <ImageIcon className="h-4 w-4" />
                                  <span className="font-medium truncate max-w-xs">{galleryUploadFile.name}</span>
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">
                                  <Upload className="h-6 w-6 mx-auto mb-1 text-purple-300" />
                                  Click to choose an image file
                                </div>
                              )}
                              <input
                                id="pricing-img-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setGalleryUploadFile(file);
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {galleryForm.type === 'imageUrl' && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Image URL *</Label>
                            <Input
                              placeholder="https://example.com/image.png"
                              value={galleryForm.url}
                              onChange={(e) => setGalleryForm({ ...galleryForm, url: e.target.value })}
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Title</Label>
                            <Input
                              placeholder="e.g., Shipping Rates to USA"
                              value={galleryForm.title}
                              onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Description</Label>
                            <Input
                              placeholder="Brief description"
                              value={galleryForm.description}
                              onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          if (galleryForm.type === 'image' && !galleryUploadFile) {
                            toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
                            return;
                          }
                          if (galleryForm.type === 'imageUrl' && !galleryForm.url.trim()) {
                            toast({ title: 'Error', description: 'Please enter an image URL', variant: 'destructive' });
                            return;
                          }
                          try {
                            if (galleryForm.type === 'image' && galleryUploadFile) {
                              const formData = new FormData();
                              formData.append('file', galleryUploadFile);
                              formData.append('type', 'image');
                              formData.append('category', 'pricing');
                              if (galleryForm.title) formData.append('title', galleryForm.title);
                              if (galleryForm.description) formData.append('description', galleryForm.description);
                              await api.gallery.upload(formData);
                            } else if (galleryForm.type === 'imageUrl') {
                              await api.gallery.create({
                                type: 'imageUrl',
                                url: galleryForm.url.trim(),
                                title: galleryForm.title.trim() || undefined,
                                description: galleryForm.description.trim() || undefined,
                                category: 'pricing',
                                isActive: true,
                              });
                            }
                            toast({ title: 'Success', description: 'Pricing image uploaded successfully' });
                            setGalleryForm({ type: 'image', url: '', title: '', description: '' });
                            setGalleryUploadFile(null);
                          } catch (error: any) {
                            toast({ title: 'Error', description: error.message || 'Failed to upload pricing image', variant: 'destructive' });
                          }
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        disabled={
                          (galleryForm.type === 'image' && !galleryUploadFile) ||
                          (galleryForm.type === 'imageUrl' && !galleryForm.url.trim())
                        }
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Pricing Image
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Manage Items Dialog */}
                  <Dialog open={!!selectedPriceSheet} onOpenChange={(open) => {
                    if (!open) {
                      setSelectedPriceSheet(null);
                      setEditingItem(null);
                      setEditingItemIndex(null);
                      setEditedItems([]);
                      setItemForm({ itemName: '', hsnCode: '', weight: '', rate: '', destination: '', country: '', countryCode: '', serviceType: '', currency: 'INR' });
                    }
                  }}>
                    <DialogContent className="max-w-5xl w-full max-h-[90vh] flex flex-col p-0 gap-0">
                      {/* Dialog Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-lg flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <DialogTitle className="text-white text-lg font-bold">
                              {selectedPriceSheet?.sheetName}
                            </DialogTitle>
                            <p className="text-blue-100 text-xs mt-0.5">
                              {editedItems.length || selectedPriceSheet?.items?.length || 0} items · Edit inline, then click Save
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 h-8 px-3 text-xs"
                            onClick={() => {
                              setSelectedPriceSheet(null);
                              setEditedItems([]);
                              setItemForm({ itemName: '', hsnCode: '', weight: '', rate: '', destination: '', country: '', countryCode: '', serviceType: '', currency: 'INR' });
                            }}
                          >
                            ✕ Close
                          </Button>
                        </div>
                      </div>

                      {/* Scrollable Body */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Add New Item Form */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <h4 className="font-semibold text-sm text-blue-800 mb-3 flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add New Item
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Item Name *</Label>
                              <Input
                                placeholder="e.g. FedEx Express"
                                value={itemForm.itemName}
                                onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Weight</Label>
                              <Input
                                placeholder="e.g. 1kg"
                                value={itemForm.weight}
                                onChange={(e) => setItemForm({ ...itemForm, weight: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Rate (₹) *</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={itemForm.rate}
                                onChange={(e) => setItemForm({ ...itemForm, rate: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Country</Label>
                              <div className="flex gap-1">
                                <Input
                                  placeholder="Select"
                                  value={itemForm.country}
                                  readOnly
                                  onClick={() => setShowCountryDialog(true)}
                                  className="h-8 text-sm cursor-pointer"
                                />
                                <Button type="button" variant="outline" size="sm" className="h-8 px-2 flex-shrink-0" onClick={() => setShowCountryDialog(true)}>
                                  <Search className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Destination</Label>
                              <Input
                                placeholder="City"
                                value={itemForm.destination}
                                onChange={(e) => setItemForm({ ...itemForm, destination: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Service Type</Label>
                              <Input
                                placeholder="Express, Standard…"
                                value={itemForm.serviceType}
                                onChange={(e) => setItemForm({ ...itemForm, serviceType: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">HSN Code</Label>
                              <Input
                                placeholder="HSN"
                                value={itemForm.hsnCode}
                                onChange={(e) => setItemForm({ ...itemForm, hsnCode: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Currency</Label>
                              <Select value={itemForm.currency} onValueChange={(v) => setItemForm({ ...itemForm, currency: v })}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
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
                            className="mt-3 bg-blue-600 hover:bg-blue-700 h-8 text-sm px-4"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add Item
                          </Button>
                        </div>

                        {/* Editable Items Table */}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-3">
                            Price Items <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{editedItems.length || selectedPriceSheet?.items?.length || 0}</span>
                          </h4>
                          {editedItems.length > 0 ? (
                            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-gray-50 border-b">
                                      <TableHead className="font-semibold text-xs text-gray-600 uppercase tracking-wide">Item Name</TableHead>
                                      {editedItems.some((i: any) => i.hsnCode) && (
                                        <TableHead className="font-semibold text-xs text-gray-600 uppercase tracking-wide">HSN</TableHead>
                                      )}
                                      {editedItems.some((i: any) => i.weight) && (
                                        <TableHead className="font-semibold text-xs text-gray-600 uppercase tracking-wide">Weight</TableHead>
                                      )}
                                      {editedItems.some((i: any) => i.country) && (
                                        <TableHead className="font-semibold text-xs text-gray-600 uppercase tracking-wide">Country</TableHead>
                                      )}
                                      {editedItems.some((i: any) => i.destination) && (
                                        <TableHead className="font-semibold text-xs text-gray-600 uppercase tracking-wide">Destination</TableHead>
                                      )}
                                      {editedItems.some((i: any) => i.serviceType) && (
                                        <TableHead className="font-semibold text-xs text-gray-600 uppercase tracking-wide">Service</TableHead>
                                      )}
                                      <TableHead className="font-semibold text-xs text-gray-600 uppercase tracking-wide text-right">Rate (₹)</TableHead>
                                      <TableHead className="font-semibold text-xs text-gray-600 uppercase tracking-wide text-center w-28">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {editedItems.map((item: any, index: number) => (
                                      <TableRow key={item._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                        <TableCell className="py-2">
                                          <Input
                                            value={item.itemName || ''}
                                            onChange={(e) => handleCellEdit(index, 'itemName', e.target.value)}
                                            className="h-8 text-sm"
                                            onBlur={() => handleSaveRow(index)}
                                            placeholder="Item name"
                                          />
                                        </TableCell>
                                        {editedItems.some((i: any) => i.hsnCode) && (
                                          <TableCell className="py-2">
                                            <Input
                                              value={item.hsnCode || ''}
                                              onChange={(e) => handleCellEdit(index, 'hsnCode', e.target.value)}
                                              className="h-8 text-sm w-24"
                                              onBlur={() => handleSaveRow(index)}
                                              placeholder="HSN"
                                            />
                                          </TableCell>
                                        )}
                                        {editedItems.some((i: any) => i.weight) && (
                                          <TableCell className="py-2">
                                            <Input
                                              value={item.weight || ''}
                                              onChange={(e) => handleCellEdit(index, 'weight', e.target.value)}
                                              className="h-8 text-sm w-24"
                                              onBlur={() => handleSaveRow(index)}
                                              placeholder="Weight"
                                            />
                                          </TableCell>
                                        )}
                                        {editedItems.some((i: any) => i.country) && (
                                          <TableCell className="py-2">
                                            <div className="flex items-center gap-1">
                                              {item.country ? (
                                                <Badge variant="outline" className="text-xs px-2 py-0.5">{item.country}</Badge>
                                              ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                              )}
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0 flex-shrink-0"
                                                onClick={() => {
                                                  setCountryDialogFor({ row: index, field: 'country' });
                                                  setShowCountryDialog(true);
                                                }}
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        )}
                                        {editedItems.some((i: any) => i.destination) && (
                                          <TableCell className="py-2">
                                            <Input
                                              value={item.destination || ''}
                                              onChange={(e) => handleCellEdit(index, 'destination', e.target.value)}
                                              className="h-8 text-sm w-28"
                                              onBlur={() => handleSaveRow(index)}
                                              placeholder="City"
                                            />
                                          </TableCell>
                                        )}
                                        {editedItems.some((i: any) => i.serviceType) && (
                                          <TableCell className="py-2">
                                            <Input
                                              value={item.serviceType || ''}
                                              onChange={(e) => handleCellEdit(index, 'serviceType', e.target.value)}
                                              className="h-8 text-sm w-28"
                                              onBlur={() => handleSaveRow(index)}
                                              placeholder="Type"
                                            />
                                          </TableCell>
                                        )}
                                        <TableCell className="py-2 text-right">
                                          <Input
                                            type="number"
                                            value={item.rate || 0}
                                            onChange={(e) => handleCellEdit(index, 'rate', parseFloat(e.target.value) || 0)}
                                            className="h-8 text-sm w-24 text-right font-bold ml-auto"
                                            onBlur={() => handleSaveRow(index)}
                                            placeholder="0"
                                          />
                                        </TableCell>
                                        <TableCell className="py-2">
                                          <div className="flex gap-1 justify-center">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleSaveRow(index)}
                                              className="h-7 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                            >
                                              Save
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleDeleteItem(selectedPriceSheet._id, item._id)}
                                              className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ) : selectedPriceSheet?.items && selectedPriceSheet.items.length > 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">Loading items...</div>
                          ) : (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                              <FileSpreadsheet className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">No items yet. Add your first item above.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

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

            </TabsContent>
          )}

          {/* Pricing Tab (Vendor only) */}
          {isVendor() && (
            <TabsContent value="pricing" className="space-y-4">
              <div className="min-h-screen">
                <Pricing />
              </div>
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

          {/* Gallery Tab (Admin only) */}
          {isAdmin() && (
            <TabsContent value="gallery" className="space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-blue-600" />
                        Gallery Management
                      </CardTitle>
                      <CardDescription>Upload and manage gallery images, videos, and YouTube links</CardDescription>
                    </div>
                    <Button onClick={handleNewGalleryItem} className="bg-gradient-primary text-white hover:opacity-90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoadingGallery ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading gallery items...</p>
                    </div>
                  ) : galleryItems.length === 0 ? (
                    <div className="text-center py-12">
                      <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">No gallery items yet</p>
                      <p className="text-muted-foreground text-sm mt-2">Click "Add Item" to upload images, videos, or add YouTube links</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {galleryItems.map((item) => (
                        <Card key={item._id} className="overflow-hidden">
                          <CardContent className="p-0">
                            {item.type === 'youtube' ? (
                              <div className="relative aspect-video bg-gray-100">
                                {(() => {
                                  const videoId = item.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
                                  return (
                                    <>
                                      <img
                                        src={videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/placeholder-video.jpg'}
                                        alt={item.title || 'YouTube Video'}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Youtube className="h-8 w-8 text-white" />
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            ) : item.type === 'video' ? (
                              <div className="relative aspect-video bg-gray-100">
                                <video
                                  src={item.url}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Video className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="relative aspect-square bg-gray-100">
                                <img
                                  src={item.url}
                                  alt={item.title || 'Gallery Image'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.type === 'youtube' ? 'YouTube' : item.type === 'video' ? 'Video' : 'Image'}
                                </Badge>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditGalleryItem(item)}
                                    className="h-7 px-2"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteGalleryItem(item._id)}
                                    className="h-7 px-2 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              {item.title && (
                                <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                              )}
                              {item.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add/Edit Gallery Item Dialog */}
              <Dialog open={showGalleryDialog} onOpenChange={setShowGalleryDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingGalleryItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
                    </DialogTitle>
                    <DialogDescription>
                      Upload images/videos, add YouTube links, or provide image URLs
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Select
                        value={galleryForm.type}
                        onValueChange={(value: 'image' | 'video' | 'youtube' | 'imageUrl') => {
                          setGalleryForm({ ...galleryForm, type: value, url: '' });
                          setGalleryUploadFile(null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4" />
                              Upload Image
                            </div>
                          </SelectItem>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Upload Video
                            </div>
                          </SelectItem>
                          <SelectItem value="youtube">
                            <div className="flex items-center gap-2">
                              <Youtube className="h-4 w-4" />
                              YouTube Link
                            </div>
                          </SelectItem>
                          <SelectItem value="imageUrl">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4" />
                              Image URL
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(galleryForm.type === 'image' || galleryForm.type === 'video') && (
                      <div className="space-y-2">
                        <Label>
                          {galleryForm.type === 'image' ? 'Upload Image' : 'Upload Video'} *
                        </Label>
                        <Input
                          type="file"
                          accept={galleryForm.type === 'image' ? 'image/*' : 'video/*'}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setGalleryUploadFile(file);
                            }
                          }}
                        />
                        {galleryUploadFile && (
                          <p className="text-sm text-muted-foreground">
                            Selected: {galleryUploadFile.name}
                          </p>
                        )}
                      </div>
                    )}

                    {(galleryForm.type === 'youtube' || galleryForm.type === 'imageUrl') && (
                      <div className="space-y-2">
                        <Label>
                          {galleryForm.type === 'youtube' ? 'YouTube URL' : 'Image URL'} *
                        </Label>
                        <Input
                          type="url"
                          placeholder={
                            galleryForm.type === 'youtube'
                              ? 'https://www.youtube.com/watch?v=...'
                              : 'https://example.com/image.jpg'
                          }
                          value={galleryForm.url}
                          onChange={(e) => setGalleryForm({ ...galleryForm, url: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Title (Optional)</Label>
                      <Input
                        type="text"
                        placeholder="Enter title"
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Textarea
                        placeholder="Enter description"
                        value={galleryForm.description}
                        onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowGalleryDialog(false);
                          setGalleryForm({ type: 'image', url: '', title: '', description: '' });
                          setGalleryUploadFile(null);
                          setEditingGalleryItem(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleGalleryUpload}>
                        {editingGalleryItem ? 'Update' : 'Add'} Item
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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

