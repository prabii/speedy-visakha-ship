import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, FileDown, Search, Edit, Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { generateInvoicePDF, generateAWBPDF, InvoiceData, InvoiceItem, AWBData } from '@/lib/pdfGenerator';
import { PDFPreview } from './PDFPreview';
import { searchHSN, HSNItem } from '@/lib/excelParser';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { countryCodes, documentTypes, searchCountries, CountryCode } from '@/lib/countryCodes';
import { vendors, services, products, searchVendors, searchServices, searchProducts, Vendor, Service, Product } from '@/lib/vendors';
import api from '@/lib/api';

interface InvoiceEntryProps {}

const InvoiceEntry: React.FC<InvoiceEntryProps> = () => {
  const { toast } = useToast();
  
  // PDF Preview State
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');
  
  // Logo Upload State
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(() => {
    const stored = localStorage.getItem('invoice_logo');
    return stored || null;
  });
  
  // Account Details
  const [accountDetails, setAccountDetails] = useState({
    bookDate: format(new Date(), 'yyyy-MM-dd'),
    accountNo: '',
    clientName: '',
    clientCode: '',
  });
  
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [exporterRef, setExporterRef] = useState('ICL');
  const [awbNo, setAwbNo] = useState('');
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null); // Track if we're editing
  const [pieces, setPieces] = useState('0');
  const [piecesUnit, setPiecesUnit] = useState('SPX');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('Kgs');
  
  // Service Details
  const [serviceDetails, setServiceDetails] = useState({
    vendor: '',
    vendorCode: '',
    service: '',
    product: '',
    productCode: '',
    shipmentValue: '',
    currency: 'INR',
    volumetricWeight: '',
    chargeWeight: '',
    commercial: false,
    oda: false,
    medicalCharges: false,
  });
  
  // Pieces Details
  const [piecesDetails, setPiecesDetails] = useState({
    measurementUnit: 'Centimeter',
    actualWeightPerPiece: 0,
    numberOfPieces: 1,
    length: 0,
    width: 0,
    height: 0,
    division: 5000,
    volumetricWeight: 0,
    chargeWeight: 0,
  });
  
  const [piecesList, setPiecesList] = useState<Array<{
    childAwb: string;
    actualWeightPerPiece: number;
    pieces: number;
    length: number;
    breadth: number;
    height: number;
    volumetricWeight: number;
    chargeWeight: number;
  }>>([]);
  
  // Shipper Details
  const [shipper, setShipper] = useState({
    serviceCenter: '',
    origin: 'VISHAKAPATNAM',
    originCode: 'VIS',
    companyName: '',
    contactName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'INDIA',
    telephone: '',
    mobileNo: '',
    email: '',
    iecNo: '',
    documentType: 'Aadhaar Number',
    documentNo: '',
  });

  // Consignee Details
  const [consignee, setConsignee] = useState({
    destination: '',
    destinationCode: '',
    companyName: '',
    contactName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    telephone: '',
    mobileNo: '',
    email: '',
    iecNo: '',
    documentType: '',
    documentNo: '',
  });

  // Manifest GST Details
  const [manifestGST, setManifestGST] = useState({
    csbType: 'CSB 4',
    termOfInvoice: '',
    gstInvoice: false,
    invoiceNo: '',
    invoiceDate: format(new Date(), 'yyyy-MM-dd'),
    departmentNo: '',
    exportReason: 'UNSOLICITED GIFT - NOT FOR SALE',
    format: '',
  });

  // Items with GST
  const [items, setItems] = useState<Array<InvoiceItem & { packages: string; unit: string; igstPercent: number; igstAmount: number }>>([]);
  const [currentItem, setCurrentItem] = useState<Partial<InvoiceItem & { packages: string; unit: string; igstPercent: number; igstAmount: number }>>({
    boxNo: 'Box-1',
    packages: '',
    description: '',
    hsnCode: '',
    quantity: 1,
    weight: 0,
    unit: 'PCS',
    rate: 0,
    amount: 0,
    igstPercent: 0,
    igstAmount: 0,
  });

  const [hsnSearchQuery, setHsnSearchQuery] = useState('');
  const [hsnResults, setHsnResults] = useState<HSNItem[]>([]);
  const [showHsnDialog, setShowHsnDialog] = useState(false);
  
  // Country code search
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [countryResults, setCountryResults] = useState<CountryCode[]>([]);
  const [countryField, setCountryField] = useState<'consignee' | 'destination' | null>(null);
  
  // Vendor/Service/Product search
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [vendorResults, setVendorResults] = useState<Vendor[]>([]);
  
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [serviceResults, setServiceResults] = useState<Service[]>([]);
  
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productResults, setProductResults] = useState<Product[]>([]);

  // Load invoice data for editing
  useEffect(() => {
    const loadEditData = () => {
      const editData = localStorage.getItem('edit_invoice_data');
      if (editData) {
        try {
          const invoiceData = JSON.parse(editData);
          
          // Clear the localStorage
          localStorage.removeItem('edit_invoice_data');
          
          // Store the invoice ID for editing
          if (invoiceData._id) {
            setEditingInvoiceId(invoiceData._id);
          }
          
          // Populate form fields
          if (invoiceData.invoiceNo) setInvoiceNo(invoiceData.invoiceNo);
          if (invoiceData.invoiceDate) {
            const date = new Date(invoiceData.invoiceDate);
            setInvoiceDate(format(date, 'yyyy-MM-dd'));
          }
          if (invoiceData.exporterRef) setExporterRef(invoiceData.exporterRef);
          if (invoiceData.awbNo) setAwbNo(invoiceData.awbNo);
          if (invoiceData.pieces) setPieces(invoiceData.pieces);
          if (invoiceData.weight) setWeight(invoiceData.weight);
          
          // Account Details
          if (invoiceData.accountNo || invoiceData.customerId) {
            setAccountDetails(prev => ({
              ...prev,
              accountNo: invoiceData.accountNo || invoiceData.customerId?.accountNo || '',
              clientName: invoiceData.customerId?.clientName || '',
              clientCode: invoiceData.customerId?.clientCode || '',
            }));
          }
          
          // Shipper Details
          if (invoiceData.shipper) {
            setShipper(prev => ({
              ...prev,
              companyName: invoiceData.shipper.companyName || '',
              contactName: invoiceData.shipper.contactName || '',
              address1: invoiceData.shipper.address1 || '',
              address2: invoiceData.shipper.address2 || '',
              city: invoiceData.shipper.city || '',
              state: invoiceData.shipper.state || '',
              pincode: invoiceData.shipper.pincode || '',
              country: invoiceData.shipper.country || 'INDIA',
              telephone: invoiceData.shipper.telephone || '',
              mobileNo: invoiceData.shipper.mobileNo || '',
              email: invoiceData.shipper.email || '',
              documentType: invoiceData.shipper.documentType || 'Aadhaar Number',
              documentNo: invoiceData.shipper.documentNo || '',
              origin: invoiceData.placeOfLoading || prev.origin,
            }));
          }
          
          // Consignee Details
          if (invoiceData.consignee) {
            setConsignee(prev => ({
              ...prev,
              companyName: invoiceData.consignee.companyName || '',
              contactName: invoiceData.consignee.contactName || '',
              address1: invoiceData.consignee.address1 || '',
              address2: invoiceData.consignee.address2 || '',
              city: invoiceData.consignee.city || '',
              state: invoiceData.consignee.state || '',
              pincode: invoiceData.consignee.pincode || '',
              country: invoiceData.consignee.country || '',
              telephone: invoiceData.consignee.telephone || '',
              mobileNo: invoiceData.consignee.mobileNo || '',
              email: invoiceData.consignee.email || '',
              destination: invoiceData.portOfDischarge || invoiceData.finalDestination || '',
            }));
          }
          
          // Manifest GST Details
          if (invoiceData.otherReference || invoiceData.termOfDelivery) {
            setManifestGST(prev => ({
              ...prev,
              exportReason: invoiceData.otherReference || prev.exportReason,
              termOfInvoice: invoiceData.termOfDelivery || prev.termOfInvoice,
            }));
          }
          
          // Items
          if (invoiceData.items && Array.isArray(invoiceData.items)) {
            const mappedItems = invoiceData.items.map((item: any) => ({
              boxNo: item.boxNo || 'Box-1',
              packages: item.packages || '',
              description: item.description || '',
              hsnCode: item.hsnCode || '',
              quantity: item.quantity || 1,
              weight: item.weight || 0,
              unit: item.unit || 'PCS',
              rate: item.rate || 0,
              amount: item.amount || 0,
              igstPercent: item.igstPercent || 0,
              igstAmount: item.igstAmount || 0,
            }));
            setItems(mappedItems);
          }
          
          toast({
            title: 'Invoice Loaded',
            description: `Invoice ${invoiceData.invoiceNo || ''} loaded for editing.`,
          });
        } catch (error) {
          console.error('Error loading invoice data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load invoice data for editing',
            variant: 'destructive',
          });
        }
      }
    };

    // Load on mount
    loadEditData();

    // Also listen for tab navigation event
    const handleTabNavigation = () => {
      // Small delay to ensure tab is switched
      setTimeout(loadEditData, 100);
    };
    
    window.addEventListener('navigateToInvoiceTab', handleTabNavigation);
    
    return () => {
      window.removeEventListener('navigateToInvoiceTab', handleTabNavigation);
    };
  }, [toast]);

  useEffect(() => {
    if (hsnSearchQuery) {
      searchHSN(hsnSearchQuery).then(setHsnResults);
    } else {
      // Load initial HSN data when no search query (show first 50 items)
      searchHSN('').then(setHsnResults);
    }
  }, [hsnSearchQuery]);

  // Load HSN data when dialog opens
  useEffect(() => {
    if (showHsnDialog) {
      // Load initial data when dialog opens
      searchHSN('').then(setHsnResults);
      setHsnSearchQuery(''); // Reset search query
    }
  }, [showHsnDialog]);

  useEffect(() => {
    if (countrySearchQuery) {
      setCountryResults(searchCountries(countrySearchQuery));
    } else {
      setCountryResults(countryCodes);
    }
  }, [countrySearchQuery]);

  useEffect(() => {
    if (vendorSearchQuery) {
      setVendorResults(searchVendors(vendorSearchQuery));
    } else {
      setVendorResults(vendors);
    }
  }, [vendorSearchQuery]);

  useEffect(() => {
    if (serviceSearchQuery) {
      setServiceResults(searchServices(serviceSearchQuery, serviceDetails.vendorCode));
    } else {
      setServiceResults(searchServices('', serviceDetails.vendorCode));
    }
  }, [serviceSearchQuery, serviceDetails.vendorCode]);

  useEffect(() => {
    if (productSearchQuery) {
      setProductResults(searchProducts(productSearchQuery));
    } else {
      setProductResults(products);
    }
  }, [productSearchQuery]);

  // Auto-calculate when pieces details change
  useEffect(() => {
    const { length, width, height, numberOfPieces, actualWeightPerPiece, division } = piecesDetails;
    
    // Calculate volumetric weight: (L x W x H) / division
    // Fix floating point precision
    const volumetricWeight = Math.round(((length * width * height * numberOfPieces) / division) * 1000) / 1000;
    
    // Charge weight is the higher of actual weight or volumetric weight
    // Fix floating point precision
    const totalActualWeight = Math.round((actualWeightPerPiece * numberOfPieces) * 1000) / 1000;
    const chargeWeight = Math.round(Math.max(totalActualWeight, volumetricWeight) * 1000) / 1000;
    
    setPiecesDetails(prev => ({
      ...prev,
      volumetricWeight: volumetricWeight,
      chargeWeight: chargeWeight,
    }));
    
    // Update service details automatically
    setServiceDetails(prev => ({
      ...prev,
      volumetricWeight: volumetricWeight.toFixed(3),
      chargeWeight: chargeWeight.toFixed(3),
    }));
    
    // Update pieces and weight
    setPieces(numberOfPieces.toString());
    setWeight(totalActualWeight.toFixed(3));
  }, [piecesDetails.length, piecesDetails.width, piecesDetails.height, piecesDetails.numberOfPieces, piecesDetails.actualWeightPerPiece, piecesDetails.division]);

  const updateShipper = (field: string, value: string) => {
    setShipper(prev => ({ ...prev, [field]: value }));
  };

  const updateConsignee = (field: string, value: string) => {
    setConsignee(prev => ({ ...prev, [field]: value }));
  };

  const updateManifestGST = (field: string, value: string | boolean) => {
    setManifestGST(prev => ({ ...prev, [field]: value }));
  };

  const updateCurrentItem = (field: string, value: string | number) => {
    setCurrentItem(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'quantity' || field === 'rate' || field === 'igstPercent') {
        const qty = typeof updated.quantity === 'number' ? updated.quantity : 1;
        const rate = typeof updated.rate === 'number' ? updated.rate : 0;
        // Fix floating point precision: round to 2 decimal places
        const amount = Math.round((qty * rate) * 100) / 100;
        updated.amount = amount;
        const igstPercent = typeof updated.igstPercent === 'number' ? updated.igstPercent : 0;
        // Fix floating point precision for IGST
        updated.igstAmount = Math.round((amount * igstPercent) * 100) / 10000;
      }
      return updated;
    });
  };

  const addItem = () => {
    if (!currentItem.description || !currentItem.hsnCode) {
      toast({
        title: 'Error',
        description: 'Please fill in description and HSN code',
        variant: 'destructive',
      });
      return;
    }
    setItems(prev => [...prev, {
      ...currentItem,
      boxNo: currentItem.boxNo || 'Box-1',
      packages: currentItem.packages || '',
      description: currentItem.description || '',
      hsnCode: currentItem.hsnCode || '',
      quantity: currentItem.quantity || 1,
      weight: currentItem.weight || 0,
      unit: currentItem.unit || 'PCS',
      rate: currentItem.rate || 0,
      amount: currentItem.amount || 0,
      igstPercent: currentItem.igstPercent || 0,
      igstAmount: currentItem.igstAmount || 0,
    } as InvoiceItem & { packages: string; unit: string; igstPercent: number; igstAmount: number }]);
    const nextBoxNo = items.length > 0 ? `Box-${items.length + 1}` : 'Box-1';
    setCurrentItem({
      boxNo: nextBoxNo,
      packages: '',
      description: '',
      hsnCode: '',
      quantity: 1,
      weight: 0,
      unit: 'PCS',
      rate: 0,
      amount: 0,
      igstPercent: 0,
      igstAmount: 0,
    });
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const selectHSN = (hsn: HSNItem) => {
    updateCurrentItem('hsnCode', hsn.hsnCode);
    updateCurrentItem('description', hsn.description);
    setShowHsnDialog(false);
    setHsnSearchQuery('');
  };

  const calculateTotal = () => {
    // Fix floating point precision
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    return Math.round(total * 100) / 100;
  };

  const calculateTotals = () => {
    // Fix floating point precision for all calculations
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    return {
      totalRecords: items.length,
      totalQuantity: Math.round(totalQuantity * 100) / 100,
      totalWeight: Math.round(totalWeight * 1000) / 1000, // 3 decimal places for weight
      totalAmount: Math.round(totalAmount * 100) / 100, // 2 decimal places for amount
    };
  };

  const GST_NUMBER = '37HVGPP7046R1ZG';

  // Clear editing state when starting fresh
  const clearEditingState = () => {
    setEditingInvoiceId(null);
  };

  const generatePDF = async () => {
    // Use manifest GST invoice details or generate defaults
    const finalInvoiceNo = manifestGST.invoiceNo || invoiceNo || 'INV-' + Date.now();
    const finalInvoiceDate = manifestGST.invoiceDate || invoiceDate || format(new Date(), 'yyyy-MM-dd');
    
    if (!finalInvoiceNo || !finalInvoiceDate) {
      toast({
        title: 'Error',
        description: 'Please fill invoice number and date',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item',
        variant: 'destructive',
      });
      return;
    }

    const invoiceData: InvoiceData = {
      invoiceNo: finalInvoiceNo,
      invoiceDate: format(new Date(finalInvoiceDate), 'dd/MM/yyyy'),
      exporterRef,
      awbNo: awbNo || undefined,
      pieces,
      weight: weight || undefined,
      shipper: {
        companyName: shipper.companyName,
        contactName: shipper.contactName,
        address1: shipper.address1,
        address2: shipper.address2 || undefined,
        city: shipper.city,
        state: shipper.state,
        pincode: shipper.pincode,
        country: shipper.country,
        telephone: shipper.telephone,
        mobileNo: shipper.mobileNo || undefined,
        email: shipper.email || undefined,
        documentType: shipper.documentType,
        documentNo: shipper.documentNo,
      },
      consignee: {
        companyName: consignee.companyName,
        contactName: consignee.contactName,
        address1: consignee.address1,
        address2: consignee.address2 || undefined,
        city: consignee.city,
        state: consignee.state,
        pincode: consignee.pincode,
        country: consignee.country,
        telephone: consignee.telephone,
        mobileNo: consignee.mobileNo || undefined,
        email: consignee.email || undefined,
      },
      preCarriageBy: undefined,
      portOfReceipt: undefined,
      vesselFlightNo: undefined,
      placeOfLoading: shipper.origin || 'VISHAKAPATNAM',
      countryOfOrigin: shipper.country || 'INDIA',
      portOfDischarge: consignee.destination || '',
      finalDestination: consignee.destination || '',
      countryOfDestination: consignee.country || '',
      otherReference: manifestGST.exportReason || undefined,
      termOfDelivery: manifestGST.termOfInvoice || undefined,
      items,
      totalAmount: calculateTotal(),
    };

    try {
      // Generate PDF first
      const pdfBlob = await generateInvoicePDF(invoiceData, GST_NUMBER, uploadedLogo);
      
      // Show preview
      setPdfBlob(pdfBlob);
      setPdfFileName(`Invoice_${finalInvoiceNo}.pdf`);
      setPdfTitle('Invoice Preview');
      setPdfPreviewOpen(true);
      
      // Save invoice to database
      try {
        // Validate required fields
        if (!shipper.companyName && !shipper.contactName) {
          throw new Error('Shipper company name or contact name is required');
        }
        
        if (!consignee.companyName && !consignee.contactName) {
          throw new Error('Consignee company name or contact name is required');
        }
        
        if (!items || items.length === 0) {
          throw new Error('At least one item is required');
        }
        
        // Convert invoiceDate to Date object (ISO string format)
        const invoiceDateObj = finalInvoiceDate ? new Date(finalInvoiceDate).toISOString() : new Date().toISOString();
        
        // Ensure all required string fields have non-empty values
        const invoicePayload = {
          invoiceNo: finalInvoiceNo.trim(),
          invoiceDate: invoiceDateObj, // ISO string format for Date type
          exporterRef: exporterRef?.trim() || undefined,
          awbNo: awbNo?.trim() || undefined,
          pieces: pieces.toString().trim() || '0',
          weight: weight?.trim() || undefined,
          shipper: {
            companyName: (shipper.companyName || '').trim(),
            contactName: (shipper.contactName || '').trim(),
            address1: (shipper.address1 || '').trim(),
            address2: shipper.address2?.trim() || undefined,
            city: (shipper.city || '').trim(),
            state: (shipper.state || '').trim(),
            pincode: (shipper.pincode || '').trim(),
            country: (shipper.country || '').trim(),
            telephone: (shipper.telephone || '').trim(),
            mobileNo: shipper.mobileNo?.trim() || undefined,
            email: shipper.email?.trim() || undefined,
            documentType: shipper.documentType?.trim() || undefined,
            documentNo: shipper.documentNo?.trim() || undefined,
          },
          consignee: {
            companyName: (consignee.companyName || '').trim(),
            contactName: (consignee.contactName || '').trim(),
            address1: (consignee.address1 || '').trim(),
            address2: consignee.address2?.trim() || undefined,
            city: (consignee.city || '').trim(),
            state: (consignee.state || '').trim(),
            pincode: (consignee.pincode || '').trim(),
            country: (consignee.country || '').trim(),
            telephone: (consignee.telephone || '').trim(),
            mobileNo: consignee.mobileNo?.trim() || undefined,
            email: consignee.email?.trim() || undefined,
          },
          placeOfLoading: (shipper.origin || 'VISHAKAPATNAM').trim(),
          countryOfOrigin: (shipper.country || 'INDIA').trim(),
          portOfDischarge: (consignee.destination || consignee.country || 'UNKNOWN').trim(),
          finalDestination: (consignee.destination || consignee.country || 'UNKNOWN').trim(),
          countryOfDestination: (consignee.country || 'UNKNOWN').trim(),
          otherReference: manifestGST.exportReason?.trim() || undefined,
          termOfDelivery: manifestGST.termOfInvoice?.trim() || undefined,
          items: items.map(item => ({
            boxNo: (item.boxNo || '1').toString().trim(),
            description: (item.description || '').trim(),
            hsnCode: (item.hsnCode || '').trim(),
            quantity: Number(item.quantity) || 0,
            weight: Number(item.weight) || 0,
            rate: Number(item.rate) || 0,
            amount: Number(item.amount) || 0,
          })),
          totalAmount: Number(calculateTotal()) || 0,
          accountNo: accountDetails.accountNo?.trim() || undefined,
          status: 'issued',
        };
        
        // Log payload for debugging (remove in production)
        console.log('Invoice payload:', JSON.stringify(invoicePayload, null, 2));
        
        // Use update if editing, otherwise create
        if (editingInvoiceId) {
          await api.invoices.update(editingInvoiceId, invoicePayload);
          toast({
            title: 'Success',
            description: 'Invoice PDF generated and updated in database successfully',
          });
          // Clear editing state after successful update
          setEditingInvoiceId(null);
        } else {
          await api.invoices.create(invoicePayload);
          toast({
            title: 'Success',
            description: 'Invoice PDF generated and saved to database successfully',
          });
        }
      } catch (dbError: any) {
        console.error('Database save error:', dbError);
        console.error('Error message:', dbError.message);
        console.error('Error stack:', dbError.stack);
        
        // Check if it's a connection error
        const isConnectionError = dbError.message?.includes('Backend server is not running') || 
                                  dbError.message?.includes('ERR_CONNECTION_REFUSED') ||
                                  dbError.message?.includes('Failed to fetch');
        
        if (isConnectionError) {
          toast({
            title: 'Warning',
            description: 'Invoice PDF generated, but backend server is not running. Please start the server to save to database.',
            variant: 'destructive',
          });
        } else {
          // If invoice already exists and we're not editing, that's okay
          if ((dbError.message?.includes('already exists') || dbError.message?.includes('duplicate')) && !editingInvoiceId) {
            toast({
              title: 'Success',
              description: 'Invoice PDF generated. Invoice already exists in database.',
            });
          } else {
            // Show the actual error message from backend
            const errorMsg = dbError.message || 'Unknown error';
            toast({
              title: 'Warning',
              description: `Invoice PDF generated but failed to save to database: ${errorMsg}. Check console for details.`,
              variant: 'destructive',
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Invoice generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate Invoice PDF: ' + (error.message || 'Unknown error'),
        variant: 'destructive',
      });
    }
  };

  // Generate AWB number in format V100000001
  const generateAWBNumber = async (): Promise<string> => {
    try {
      // Try to get the latest AWB number from database
      const response = await api.awb.getAll({ limit: 100, page: 1 });
      if (response.awbs && response.awbs.length > 0) {
        // Find the highest AWB number
        let maxNum = 0;
        response.awbs.forEach((awb: any) => {
          const match = awb.awbNo?.match(/V(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) {
              maxNum = num;
            }
          }
        });
        
        if (maxNum > 0) {
          const nextNum = maxNum + 1;
          return `V${nextNum.toString().padStart(9, '0')}`;
        }
      }
    } catch (error) {
      console.log('Could not fetch latest AWB, starting from V100000001');
    }
    // Default starting number
    return 'V100000001';
  };

  const generateAWB = async () => {
    // Use AWB number from state or generate a new one
    let finalAwbNo = awbNo?.trim();
    if (!finalAwbNo) {
      finalAwbNo = await generateAWBNumber();
      setAwbNo(finalAwbNo);
    }

    if (!accountDetails.accountNo || !accountDetails.clientName) {
      toast({
        title: 'Error',
        description: 'Please fill account number and client name',
        variant: 'destructive',
      });
      return;
    }

    // Calculate dimensions from pieces list
    const dimensions = piecesList.map(p => {
      return `${p.length}*${p.breadth}*${p.height}*${p.pieces}=${(p.length * p.breadth * p.height * p.pieces / 5000).toFixed(3)}`;
    }).join('; ');

    const awbData: AWBData = {
      awbNo: finalAwbNo,
      accountNo: accountDetails.accountNo,
      customer: accountDetails.clientName,
      origin: shipper.origin || 'HYDERABAD',
      destination: consignee.destination || consignee.country || '',
      service: serviceDetails.vendor || serviceDetails.service || 'PXC-SELF', // Use vendor name for AWB display
      bookingDate: format(new Date(accountDetails.bookDate), 'dd/MM/yyyy'),
      companyName: 'VISAKHA INTERNATIONAL COURIERS',
      website: 'WWW.VISAKHACOURIERS.COM',
      email: 'INFO@VISAKHACOURIERS.COM',
      shipper: {
        companyName: shipper.companyName,
        contactName: shipper.contactName,
        address1: shipper.address1,
        address2: shipper.address2 || undefined,
        city: shipper.city,
        state: shipper.state,
        pincode: shipper.pincode,
        country: shipper.country,
        telephone: shipper.telephone,
        mobileNo: shipper.mobileNo || undefined,
        email: shipper.email || undefined,
        documentType: shipper.documentType,
        documentNo: shipper.documentNo,
      },
      consignee: {
        companyName: consignee.companyName,
        contactName: consignee.contactName,
        address1: consignee.address1,
        address2: consignee.address2 || undefined,
        city: consignee.city,
        state: consignee.state,
        pincode: consignee.pincode,
        country: consignee.country,
        telephone: consignee.telephone,
        mobileNo: consignee.mobileNo || undefined,
        email: consignee.email || undefined,
      },
      description: items.map(item => item.description).join(', ') || 'FABRIC CLOTH, PCS, HOMEMADE',
      pieces: pieces,
      weight: weight || '0.000',
      chargeableWeight: serviceDetails.chargeWeight || weight || '0.000',
      shipmentValue: serviceDetails.shipmentValue || '0',
      volumetricWeight: serviceDetails.volumetricWeight || weight || undefined,
      dimensions: dimensions || undefined,
      paymentMethod: 'TOPAY',
      invoiceNo: invoiceNo || undefined,
      routingCode: undefined,
      ewayBillNo: undefined,
      gstNo: GST_NUMBER,
    };

    try {
      // Generate PDF first
      const pdfBlob = await generateAWBPDF(awbData, uploadedLogo);
      
      // Show preview
      setPdfBlob(pdfBlob);
      setPdfFileName(`AWB_${awbNo || 'NEW'}.pdf`);
      setPdfTitle('AWB Preview');
      setPdfPreviewOpen(true);
      
      // Save AWB to database
      try {
        // Validate required fields before sending
        if (!accountDetails.accountNo || !accountDetails.clientName) {
          throw new Error('Account number and client name are required');
        }
        
        if (!shipper.companyName && !shipper.contactName) {
          throw new Error('Shipper company name or contact name is required');
        }
        
        if (!consignee.companyName && !consignee.contactName) {
          throw new Error('Consignee company name or contact name is required');
        }
        
        const awbPayload: any = {
          awbNo: finalAwbNo,
          accountNo: accountDetails.accountNo,
          customer: accountDetails.clientName,
          origin: shipper.origin || 'HYDERABAD',
          destination: consignee.destination || consignee.country || 'UNKNOWN',
          service: serviceDetails.vendor || serviceDetails.service || 'PXC-SELF', // Use vendor name for AWB display
          bookingDate: accountDetails.bookDate ? new Date(accountDetails.bookDate).toISOString() : new Date().toISOString(),
          companyName: 'VISAKHA INTERNATIONAL COURIERS',
          website: 'WWW.VISAKHACOURIERS.COM',
          email: 'INFO@VISAKHACOURIERS.COM',
          shipper: {
            companyName: shipper.companyName,
            contactName: shipper.contactName,
            address1: shipper.address1,
            address2: shipper.address2 || undefined,
            city: shipper.city,
            state: shipper.state,
            pincode: shipper.pincode,
            country: shipper.country,
            telephone: shipper.telephone,
            mobileNo: shipper.mobileNo || undefined,
            email: shipper.email || undefined,
            documentType: shipper.documentType,
            documentNo: shipper.documentNo,
          },
          consignee: {
            companyName: consignee.companyName,
            contactName: consignee.contactName,
            address1: consignee.address1,
            address2: consignee.address2 || undefined,
            city: consignee.city,
            state: consignee.state,
            pincode: consignee.pincode,
            country: consignee.country,
            telephone: consignee.telephone,
            mobileNo: consignee.mobileNo || undefined,
            email: consignee.email || undefined,
          },
          description: items.map(item => item.description).join(', ') || 'FABRIC CLOTH, PCS, HOMEMADE',
          pieces: pieces.toString(),
          weight: weight || '0.000',
          chargeableWeight: serviceDetails.chargeWeight || weight || '0.000',
          shipmentValue: serviceDetails.shipmentValue || '0',
          volumetricWeight: serviceDetails.volumetricWeight || weight || undefined,
          dimensions: dimensions || undefined,
          paymentMethod: 'TOPAY',
          invoiceNo: invoiceNo || undefined,
          gstNo: GST_NUMBER,
          // Status must be one of: 'Couriers', 'Courier Pickup', 'Shipped', 'Intransit', 'Arrived at Destination', 'Out for Delivery', 'Pending Order', 'Delivered'
          status: 'Pending Order',
          trackingHistory: [{
            status: 'Pending Order',
            description: 'AWB created',
            timestamp: new Date().toISOString(),
            updatedBy: 'System'
          }]
        };
        
        // Log payload to verify status is correct
        console.log('AWB Payload Status:', awbPayload.status);
        
        await api.awb.create(awbPayload);
        
        // Also save invoice if invoice number exists
        if (invoiceNo && invoiceDate) {
          try {
            const invoicePayload = {
              invoiceNo: invoiceNo,
              invoiceDate: invoiceDate,
              exporterRef: exporterRef || undefined,
              awbNo: finalAwbNo,
              pieces: pieces.toString(),
              weight: weight || undefined,
              shipper: {
                companyName: shipper.companyName,
                contactName: shipper.contactName,
                address1: shipper.address1,
                address2: shipper.address2 || undefined,
                city: shipper.city,
                state: shipper.state,
                pincode: shipper.pincode,
                country: shipper.country,
                telephone: shipper.telephone,
                mobileNo: shipper.mobileNo || undefined,
                email: shipper.email || undefined,
                documentType: shipper.documentType,
                documentNo: shipper.documentNo,
              },
              consignee: {
                companyName: consignee.companyName,
                contactName: consignee.contactName,
                address1: consignee.address1,
                address2: consignee.address2 || undefined,
                city: consignee.city,
                state: consignee.state,
                pincode: consignee.pincode,
                country: consignee.country,
                telephone: consignee.telephone,
                mobileNo: consignee.mobileNo || undefined,
                email: consignee.email || undefined,
              },
              placeOfLoading: shipper.origin || 'VISHAKAPATNAM',
              countryOfOrigin: shipper.country || 'INDIA',
              portOfDischarge: consignee.destination || '',
              finalDestination: consignee.destination || '',
              countryOfDestination: consignee.country || '',
              otherReference: manifestGST.exportReason || undefined,
              termOfDelivery: manifestGST.termOfInvoice || undefined,
              items: items.map(item => ({
                boxNo: item.boxNo || '1',
                description: item.description,
                hsnCode: item.hsnCode || '',
                quantity: item.quantity,
                weight: item.weight || 0,
                rate: item.rate,
                amount: item.amount,
              })),
              totalAmount: calculateTotal(),
              accountNo: accountDetails.accountNo,
              status: 'issued',
            };
            
            await api.invoices.create(invoicePayload);
          } catch (invoiceError: any) {
            // If invoice already exists, that's okay - just log it
            console.log('Invoice save note:', invoiceError.message);
          }
        }
        
        toast({
          title: 'Success',
          description: 'AWB PDF generated and saved to database successfully',
        });
      } catch (dbError: any) {
        console.error('Database save error:', dbError);
        // Check if it's a connection error
        const isConnectionError = dbError.message?.includes('Backend server is not running') || 
                                  dbError.message?.includes('ERR_CONNECTION_REFUSED') ||
                                  dbError.message?.includes('Failed to fetch');
        
        if (isConnectionError) {
          toast({
            title: 'Warning',
            description: 'AWB PDF generated, but backend server is not running. Please start the server to save to database.',
            variant: 'destructive',
          });
        } else {
          // If AWB already exists, that's okay
          if (dbError.message?.includes('already exists')) {
            toast({
              title: 'Success',
              description: 'AWB PDF generated. AWB already exists in database.',
            });
          } else {
            toast({
              title: 'Warning',
              description: 'AWB PDF generated but failed to save to database: ' + (dbError.message || 'Unknown error'),
              variant: 'destructive',
            });
          }
        }
      }
    } catch (error: any) {
      console.error('AWB generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AWB PDF: ' + (error.message || 'Unknown error'),
        variant: 'destructive',
      });
    }
  };

  const openCountryDialog = (field: 'consignee' | 'destination') => {
    setCountryField(field);
    setCountrySearchQuery('');
    setCountryResults(countryCodes);
    setShowCountryDialog(true);
  };

  const selectCountry = (country: CountryCode) => {
    if (countryField === 'consignee') {
      // Update country, destination, and destination code
      updateConsignee('country', country.name);
      updateConsignee('destination', country.name);
      updateConsignee('destinationCode', country.code);
    } else if (countryField === 'destination') {
      // Update consignee country for destination
      updateConsignee('country', country.name);
      updateConsignee('destination', country.name);
      updateConsignee('destinationCode', country.code);
    }
    setShowCountryDialog(false);
    setCountryField(null);
  };

  const resizeImage = (file: File, maxWidth: number = 400, maxHeight: number = 120): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          // Calculate aspect ratio
          const aspectRatio = width / height;
          
          // Resize if image is larger than max dimensions
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              // Landscape or square
              width = Math.min(width, maxWidth);
              height = width / aspectRatio;
              
              // If height still exceeds max, adjust
              if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
              }
            } else {
              // Portrait
              height = Math.min(height, maxHeight);
              width = height * aspectRatio;
              
              // If width still exceeds max, adjust
              if (width > maxWidth) {
                width = maxWidth;
                height = width / aspectRatio;
              }
            }
          }
          
          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Use high-quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64
          const resizedBase64 = canvas.toDataURL('image/png', 0.95);
          resolve(resizedBase64);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file (PNG, JPG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Show loading toast
      toast({
        title: 'Processing Logo',
        description: 'Resizing logo to optimal dimensions...',
      });

      // Auto-resize to optimal dimensions (400x120 max, maintaining aspect ratio)
      const resizedBase64 = await resizeImage(file, 400, 120);
      
      setUploadedLogo(resizedBase64);
      localStorage.setItem('invoice_logo', resizedBase64);
      
      toast({
        title: 'Logo Uploaded & Resized',
        description: `Logo has been automatically resized and will be used in invoice and AWB PDFs`,
      });
    } catch (error) {
      console.error('Error processing logo:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to process the image. Please try again.',
        variant: 'destructive',
      });
    }
    
    // Reset file input
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    setUploadedLogo(null);
    localStorage.removeItem('invoice_logo');
    toast({
      title: 'Logo Removed',
      description: 'Default logo will be used',
    });
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-md">
              <CardTitle className="text-white m-0">Company Logo</CardTitle>
            </div>
          </div>
          <CardDescription>Upload your company logo to use in Invoice and AWB PDFs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo Preview */}
            <div className="flex-shrink-0">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 w-64 h-48 flex items-center justify-center">
                {uploadedLogo ? (
                  <div className="relative w-full h-full">
                    <img
                      src={uploadedLogo}
                      alt="Company Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Remove Logo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No logo uploaded</p>
                    <p className="text-xs mt-1">Default logo will be used</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                    <Upload className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Click to upload logo</span>
                  </div>
                </Label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">📏 Recommended Logo Size:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• <strong>Optimal:</strong> 300-400px width × 100-120px height</li>
                    <li>• <strong>Aspect Ratio:</strong> 3:1 to 3.5:1 (wider than tall)</li>
                    <li>• <strong>Minimum:</strong> 200px width × 60px height</li>
                    <li>• <strong>Maximum:</strong> 500px width × 150px height</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <p>• Supported formats: PNG, JPG, JPEG</p>
                  <p>• Maximum file size: 5MB</p>
                  <p>• Logo will appear on all generated Invoice and AWB PDFs</p>
                  <p className="text-xs text-amber-600 mt-2">💡 Tip: Use a transparent PNG background for best results</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Details Section */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-white m-0 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Account Details
          </CardTitle>
          <CardDescription className="text-blue-100 mt-1">
            Enter booking and client information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bookDate" className="text-sm font-semibold">
                Book Date <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="bookDate"
                type="date" 
                value={accountDetails.bookDate} 
                onChange={(e) => setAccountDetails(prev => ({ ...prev, bookDate: e.target.value }))}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNo" className="text-sm font-semibold">
                Account Number
              </Label>
              <Input 
                id="accountNo"
                value={accountDetails.accountNo} 
                onChange={(e) => setAccountDetails(prev => ({ ...prev, accountNo: e.target.value }))} 
                placeholder="Enter account number"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sm font-semibold">
                Client Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="clientName"
                value={accountDetails.clientName} 
                onChange={(e) => setAccountDetails(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Enter client name"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientCode" className="text-sm font-semibold">
                Client Code
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="clientCode"
                  value={accountDetails.clientCode} 
                  onChange={(e) => setAccountDetails(prev => ({ ...prev, clientCode: e.target.value }))} 
                  placeholder="Enter client code"
                  className="h-10 flex-1"
                />
                <Button variant="outline" size="icon" className="h-10 w-10" title="Edit client code">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three Column Layout: Shipper, Consignee, Services */}
      <div className="grid grid-cols-3 gap-4">
        {/* Shipper Details */}
        <Card>
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-white m-0">Shipper Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div>
              <Label>Service Center</Label>
              <Select value={shipper.serviceCenter} onValueChange={(v) => updateShipper('serviceCenter', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Service Center" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VSP">Visakhapatnam</SelectItem>
                  <SelectItem value="HYD">Hyderabad</SelectItem>
                  <SelectItem value="BLR">Bangalore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Origin *</Label>
              <div className="flex gap-2">
                <Input value={shipper.origin} onChange={(e) => updateShipper('origin', e.target.value)} />
                <Input value={shipper.originCode} onChange={(e) => updateShipper('originCode', e.target.value)} className="w-20" />
                <Button type="button" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Company Name *</Label>
              <div className="flex gap-2">
                <Input value={shipper.companyName} onChange={(e) => updateShipper('companyName', e.target.value)} />
                <Button type="button" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Contact Name</Label>
              <Input value={shipper.contactName} onChange={(e) => updateShipper('contactName', e.target.value)} />
            </div>
            <div>
              <Label>Address 1</Label>
              <Input value={shipper.address1} onChange={(e) => updateShipper('address1', e.target.value)} />
            </div>
            <div>
              <Label>Address 2</Label>
              <Input value={shipper.address2} onChange={(e) => updateShipper('address2', e.target.value)} />
            </div>
            <div>
              <Label>Pincode</Label>
              <Input value={shipper.pincode} onChange={(e) => updateShipper('pincode', e.target.value)} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={shipper.city} onChange={(e) => updateShipper('city', e.target.value)} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={shipper.state} onChange={(e) => updateShipper('state', e.target.value)} />
            </div>
            <div>
              <Label>Telephone</Label>
              <Input value={shipper.telephone} onChange={(e) => updateShipper('telephone', e.target.value)} />
            </div>
            <div>
              <Label>Mobile No.</Label>
              <Input value={shipper.mobileNo} onChange={(e) => updateShipper('mobileNo', e.target.value)} />
            </div>
            <div>
              <Label>E-Mail</Label>
              <Input type="email" value={shipper.email} onChange={(e) => updateShipper('email', e.target.value)} />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={shipper.country} onChange={(e) => updateShipper('country', e.target.value)} />
            </div>
            <div>
              <Label>IEC No.</Label>
              <Input value={shipper.iecNo} onChange={(e) => updateShipper('iecNo', e.target.value)} />
            </div>
            <div>
              <Label>Document Type</Label>
              <Select value={shipper.documentType} onValueChange={(v) => updateShipper('documentType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((docType) => (
                    <SelectItem key={docType} value={docType}>
                      {docType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Document No.</Label>
              <Input value={shipper.documentNo} onChange={(e) => updateShipper('documentNo', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Consignee Details */}
        <Card>
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-white m-0">Consignee Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div>
              <Label>Destination *</Label>
              <div className="flex gap-2">
                <Input 
                  value={consignee.destination} 
                  onChange={(e) => updateConsignee('destination', e.target.value)} 
                  className={!consignee.destination ? 'border-red-500' : ''}
                />
                <Input 
                  value={consignee.destinationCode} 
                  onChange={(e) => updateConsignee('destinationCode', e.target.value)} 
                  className="w-20"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => openCountryDialog('consignee')}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Company Name *</Label>
              <div className="flex gap-2">
                <Input 
                  value={consignee.companyName} 
                  onChange={(e) => updateConsignee('companyName', e.target.value)} 
                  className={!consignee.companyName ? 'border-red-500' : ''}
                />
                <Button type="button" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Contact Name</Label>
              <Input value={consignee.contactName} onChange={(e) => updateConsignee('contactName', e.target.value)} />
            </div>
            <div>
              <Label>Address 1 *</Label>
              <Input 
                value={consignee.address1} 
                onChange={(e) => updateConsignee('address1', e.target.value)} 
                className={!consignee.address1 ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label>Apartment/Address 2</Label>
              <Input value={consignee.address2} onChange={(e) => updateConsignee('address2', e.target.value)} />
            </div>
            <div>
              <Label>Pincode *</Label>
              <Input 
                value={consignee.pincode} 
                onChange={(e) => updateConsignee('pincode', e.target.value)} 
                className={!consignee.pincode ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label>City *</Label>
              <Input 
                value={consignee.city} 
                onChange={(e) => updateConsignee('city', e.target.value)} 
                className={!consignee.city ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label>State *</Label>
              <Input 
                value={consignee.state} 
                onChange={(e) => updateConsignee('state', e.target.value)} 
                className={!consignee.state ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label>Telephone *</Label>
              <Input 
                value={consignee.telephone} 
                onChange={(e) => updateConsignee('telephone', e.target.value)} 
                className={!consignee.telephone ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label>Mobile No.</Label>
              <Input value={consignee.mobileNo} onChange={(e) => updateConsignee('mobileNo', e.target.value)} />
            </div>
            <div>
              <Label>E-Mail</Label>
              <Input type="email" value={consignee.email} onChange={(e) => updateConsignee('email', e.target.value)} />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={consignee.country} onChange={(e) => updateConsignee('country', e.target.value)} />
            </div>
            <div>
              <Label>IEC No.</Label>
              <Input value={consignee.iecNo} onChange={(e) => updateConsignee('iecNo', e.target.value)} />
            </div>
            <div>
              <Label>Document Type</Label>
              <Select value={consignee.documentType} onValueChange={(v) => updateConsignee('documentType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((docType) => (
                    <SelectItem key={docType} value={docType}>
                      {docType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Document No.</Label>
              <Input value={consignee.documentNo} onChange={(e) => updateConsignee('documentNo', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Services Details */}
        <Card>
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-white m-0">Services Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
          <div>
            <Label>Vendor *</Label>
            <div className="flex gap-2">
              <Input 
                value={serviceDetails.vendor} 
                onChange={(e) => setServiceDetails(prev => ({ ...prev, vendor: e.target.value }))} 
                placeholder="Select vendor"
              />
              <Input 
                value={serviceDetails.vendorCode} 
                onChange={(e) => setServiceDetails(prev => ({ ...prev, vendorCode: e.target.value }))} 
                className="w-20"
                placeholder="Code"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => {
                  setVendorSearchQuery('');
                  setVendorResults(vendors);
                  setShowVendorDialog(true);
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label>Service *</Label>
            <div className="flex gap-2">
              <Input 
                value={serviceDetails.service} 
                onChange={(e) => setServiceDetails(prev => ({ ...prev, service: e.target.value }))} 
                placeholder="Select service"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => {
                  setServiceSearchQuery('');
                  setServiceResults(searchServices('', serviceDetails.vendorCode));
                  setShowServiceDialog(true);
                }}
                disabled={!serviceDetails.vendorCode}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label>Product *</Label>
            <div className="flex gap-2">
              <Input 
                value={serviceDetails.product} 
                onChange={(e) => setServiceDetails(prev => ({ ...prev, product: e.target.value }))} 
                placeholder="Select product"
              />
              <Input 
                value={serviceDetails.productCode} 
                onChange={(e) => setServiceDetails(prev => ({ ...prev, productCode: e.target.value }))} 
                className="w-20"
                placeholder="Code"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => {
                  setProductSearchQuery('');
                  setProductResults(products);
                  setShowProductDialog(true);
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label>Shipment Value</Label>
            <div className="flex gap-2">
              <Input 
                type="number"
                value={serviceDetails.shipmentValue} 
                onChange={(e) => setServiceDetails(prev => ({ ...prev, shipmentValue: e.target.value }))} 
              />
              <Select value={serviceDetails.currency} onValueChange={(v) => setServiceDetails(prev => ({ ...prev, currency: v }))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                  <SelectItem value="BHD">BHD</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                  <SelectItem value="CNY">CNY</SelectItem>
                  <SelectItem value="DHS">DHS</SelectItem>
                  <SelectItem value="DZD">DZD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="HKD">HKD</SelectItem>
                  <SelectItem value="HUF">HUF</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="IQD">IQD</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  <SelectItem value="JYE">JYE</SelectItem>
                  <SelectItem value="MXN">MXN</SelectItem>
                  <SelectItem value="NIS">NIS</SelectItem>
                  <SelectItem value="NZD">NZD</SelectItem>
                  <SelectItem value="PHP">PHP</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Pieces *</Label>
            <div className="flex gap-2">
              <Input 
                type="number"
                value={pieces} 
                onChange={(e) => {
                  setPieces(e.target.value);
                  const numPieces = parseInt(e.target.value) || 0;
                  setPiecesDetails(prev => ({ ...prev, numberOfPieces: numPieces }));
                }} 
              />
              <Select value={piecesUnit} onValueChange={setPiecesUnit}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPX">SPX</SelectItem>
                  <SelectItem value="DOX">DOX</SelectItem>
                  <SelectItem value="PKT">PKT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Actual Weight *</Label>
            <div className="flex gap-2">
              <Input 
                type="number"
                step="0.001"
                value={weight} 
                onChange={(e) => {
                  setWeight(e.target.value);
                  const weightVal = parseFloat(e.target.value) || 0;
                  const numPieces = piecesDetails.numberOfPieces || 1;
                  setPiecesDetails(prev => ({ ...prev, actualWeightPerPiece: weightVal / numPieces }));
                }} 
              />
              <Select value={weightUnit} onValueChange={setWeightUnit}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kgs">Kgs</SelectItem>
                  <SelectItem value="Lbs">Lbs</SelectItem>
                  <SelectItem value="CBM">CBM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Volumetric Weight</Label>
            <Input 
              type="number"
              step="0.001"
              value={serviceDetails.volumetricWeight} 
              readOnly
            />
          </div>
            <div>
              <Label>Charge Weight *</Label>
              <div className="flex gap-2">
                <Input 
                  type="number"
                  step="0.001"
                  value={serviceDetails.chargeWeight} 
                  readOnly
                />
                <Input 
                  type="number"
                  step="0.001"
                  value={serviceDetails.chargeWeight} 
                  readOnly
                  className="w-20"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="commercial"
                checked={serviceDetails.commercial}
                onChange={(e) => setServiceDetails(prev => ({ ...prev, commercial: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="commercial" className="cursor-pointer">Commercial</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="oda"
                checked={serviceDetails.oda}
                onChange={(e) => setServiceDetails(prev => ({ ...prev, oda: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="oda" className="cursor-pointer">ODA</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="medicalCharges"
                checked={serviceDetails.medicalCharges}
                onChange={(e) => setServiceDetails(prev => ({ ...prev, medicalCharges: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="medicalCharges" className="cursor-pointer">Medical Charges</Label>
            </div>
            <div>
              <Button type="button" variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
                Rate Compare
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pieces Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Click here to enter Pieces details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Measurement Unit</Label>
              <Select 
                value={piecesDetails.measurementUnit} 
                onValueChange={(v) => setPiecesDetails(prev => ({ ...prev, measurementUnit: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Centimeter">Centimeter</SelectItem>
                  <SelectItem value="Inch">Inch</SelectItem>
                  <SelectItem value="Meter">Meter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Actl Weight/PCS</Label>
              <Input 
                type="number"
                step="0.001"
                value={piecesDetails.actualWeightPerPiece} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPiecesDetails(prev => ({ ...prev, actualWeightPerPiece: val }));
                }} 
              />
            </div>
            <div>
              <Label>No. Of Pieces</Label>
              <Input 
                type="number"
                value={piecesDetails.numberOfPieces} 
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setPiecesDetails(prev => ({ ...prev, numberOfPieces: val }));
                }} 
              />
            </div>
            <div>
              <Label>Length</Label>
              <Input 
                type="number"
                step="0.001"
                value={piecesDetails.length} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPiecesDetails(prev => ({ ...prev, length: val }));
                }} 
              />
            </div>
            <div>
              <Label>Width</Label>
              <Input 
                type="number"
                step="0.001"
                value={piecesDetails.width} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPiecesDetails(prev => ({ ...prev, width: val }));
                }} 
              />
            </div>
            <div>
              <Label>Height</Label>
              <Input 
                type="number"
                step="0.001"
                value={piecesDetails.height} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPiecesDetails(prev => ({ ...prev, height: val }));
                }} 
              />
            </div>
            <div>
              <Label>Division</Label>
              <Input 
                type="number"
                value={piecesDetails.division} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 5000;
                  setPiecesDetails(prev => ({ ...prev, division: val }));
                }} 
              />
            </div>
            <div>
              <Label>Vol Weight (Discount - 0%)</Label>
              <Input 
                type="number"
                step="0.001"
                value={piecesDetails.volumetricWeight.toFixed(3)} 
                readOnly
              />
            </div>
            <div>
              <Label>Chrg Weight</Label>
              <Input 
                type="number"
                step="0.001"
                value={piecesDetails.chargeWeight.toFixed(3)} 
                readOnly
              />
            </div>
            <div className="col-span-4">
              <Button 
                type="button"
                onClick={() => {
                  setPiecesList(prev => [...prev, {
                    childAwb: '',
                    actualWeightPerPiece: piecesDetails.actualWeightPerPiece,
                    pieces: piecesDetails.numberOfPieces,
                    length: piecesDetails.length,
                    breadth: piecesDetails.width,
                    height: piecesDetails.height,
                    volumetricWeight: piecesDetails.volumetricWeight,
                    chargeWeight: piecesDetails.chargeWeight,
                  }]);
                  // Reset form
                  setPiecesDetails({
                    measurementUnit: 'Centimeter',
                    actualWeightPerPiece: 0,
                    numberOfPieces: 1,
                    length: 0,
                    width: 0,
                    height: 0,
                    division: 5000,
                    volumetricWeight: 0,
                    chargeWeight: 0,
                  });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          {piecesList.length > 0 && (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Child AWB</TableHead>
                    <TableHead>Actl Weight/PCS</TableHead>
                    <TableHead>Pieces</TableHead>
                    <TableHead>Length</TableHead>
                    <TableHead>Breadth</TableHead>
                    <TableHead>Height</TableHead>
                    <TableHead>Volumetric Weight</TableHead>
                    <TableHead>Charge Weight</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {piecesList.map((piece, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input 
                          value={piece.childAwb} 
                          onChange={(e) => {
                            const updated = [...piecesList];
                            updated[index].childAwb = e.target.value;
                            setPiecesList(updated);
                          }}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>{piece.actualWeightPerPiece.toFixed(3)}</TableCell>
                      <TableCell>{piece.pieces}</TableCell>
                      <TableCell>{piece.length.toFixed(3)}</TableCell>
                      <TableCell>{piece.breadth.toFixed(3)}</TableCell>
                      <TableCell>{piece.height.toFixed(3)}</TableCell>
                      <TableCell>{piece.volumetricWeight.toFixed(3)}</TableCell>
                      <TableCell>{piece.chargeWeight.toFixed(3)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setPiecesList(prev => prev.filter((_, i) => i !== index));
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manifest GST Detail Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-md">
              <CardTitle className="text-white m-0">Manifest GST Detail</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>CSB_Type</Label>
              <Select value={manifestGST.csbType} onValueChange={(v) => updateManifestGST('csbType', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSB 4">CSB 4</SelectItem>
                  <SelectItem value="CSB 5">CSB 5</SelectItem>
                  <SelectItem value="CSB 3">CSB 3</SelectItem>
                  <SelectItem value="COMMERCIAL">COMMERCIAL</SelectItem>
                  <SelectItem value="ECM DOX">ECM DOX</SelectItem>
                  <SelectItem value="ECM SPX">ECM SPX</SelectItem>
                  <SelectItem value="CBE XII">CBE XII</SelectItem>
                  <SelectItem value="CBE XIII">CBE XIII</SelectItem>
                  <SelectItem value="Amazon FBA">Amazon FBA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Term Of Invoice</Label>
              <Select value={manifestGST.termOfInvoice} onValueChange={(v) => updateManifestGST('termOfInvoice', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CFR">Cost and Freight (CFR)</SelectItem>
                  <SelectItem value="CIF">Cost, Insurance and Freight (CIF)</SelectItem>
                  <SelectItem value="CIP">Carriage and Insurance Paid (CIP)</SelectItem>
                  <SelectItem value="CPT">Carriage Paid To (CPT)</SelectItem>
                  <SelectItem value="DAF">Delivered At Frontier (DAF)</SelectItem>
                  <SelectItem value="DAP">Delivered at Place (DAP)</SelectItem>
                  <SelectItem value="DAT">Delivered at Terminal (DAT)</SelectItem>
                  <SelectItem value="DDP">Delivery Duty Paid (DDP)</SelectItem>
                  <SelectItem value="DDU">Delivery Duty Unpaid (DDU)</SelectItem>
                  <SelectItem value="DEQ">Delivered Ex Quay (DEQ)</SelectItem>
                  <SelectItem value="DES">Delivered Ex Ship (DES)</SelectItem>
                  <SelectItem value="EXW">Ex Works (EXW)</SelectItem>
                  <SelectItem value="FAS">Free Along Side (FAS)</SelectItem>
                  <SelectItem value="FCA">Free Carrier (FCA)</SelectItem>
                  <SelectItem value="FOB">Free On Board (FOB)</SelectItem>
                  <SelectItem value="UNK">Unknown (UNK)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>GST Invoice</Label>
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={manifestGST.gstInvoice}
                  onCheckedChange={(checked) => updateManifestGST('gstInvoice', checked)}
                />
                <span className={manifestGST.gstInvoice ? 'text-green-600 font-semibold' : 'text-green-600 font-semibold'}>
                  {manifestGST.gstInvoice ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <div>
              <Label>Invoice No</Label>
              <Input 
                value={manifestGST.invoiceNo} 
                onChange={(e) => updateManifestGST('invoiceNo', e.target.value)} 
              />
            </div>
            <div>
              <Label>Invoice Date</Label>
              <Input 
                type="date"
                value={manifestGST.invoiceDate} 
                onChange={(e) => updateManifestGST('invoiceDate', e.target.value)} 
              />
            </div>
            <div>
              <Label>Department No</Label>
              <Input 
                value={manifestGST.departmentNo} 
                onChange={(e) => updateManifestGST('departmentNo', e.target.value)} 
              />
            </div>
            <div>
              <Label>Export Reason:</Label>
              <Select value={manifestGST.exportReason} onValueChange={(v) => updateManifestGST('exportReason', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNSOLICITED GIFT - NOT FOR SALE">UNSOLICITED GIFT - NOT FOR SALE</SelectItem>
                  <SelectItem value="For personal reason not for sale">
                    <span className="font-bold">For personal reason not for sale</span>
                  </SelectItem>
                  <SelectItem value="COMMERCIAL SAMPLE">COMMERCIAL SAMPLE</SelectItem>
                  <SelectItem value="RETURNED GOODS">RETURNED GOODS</SelectItem>
                  <SelectItem value="DOCUMENTS">DOCUMENTS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Format</Label>
              <Select value={manifestGST.format} onValueChange={(v) => updateManifestGST('format', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2B">B2B</SelectItem>
                  <SelectItem value="C2C">C2C</SelectItem>
                  <SelectItem value="COM">COM</SelectItem>
                  <SelectItem value="CSB 5">CSB 5</SelectItem>
                  <SelectItem value="PERSONAL">PERSONAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="default" className="bg-green-600 hover:bg-green-700">
              Buyer Details
            </Button>
            <Button variant="default" className="bg-green-600 hover:bg-green-700">
              Additional Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items Section with GST */}
      <Card>
        <CardHeader>
          <CardTitle>Click here to enter performa details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-10 gap-3">
            <div>
              <Label>Box No</Label>
              <Select 
                value={currentItem.boxNo || 'Box-1'} 
                onValueChange={(v) => updateCurrentItem('boxNo', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => (
                    <SelectItem key={i + 1} value={`Box-${i + 1}`}>Box-{i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Packages</Label>
              <Input 
                value={currentItem.packages || ''} 
                onChange={(e) => updateCurrentItem('packages', e.target.value)} 
              />
            </div>
            <div>
              <Label>Description *</Label>
              <div className="flex gap-2">
                <Input 
                  value={currentItem.description || ''} 
                  onChange={(e) => updateCurrentItem('description', e.target.value)} 
                />
                <Dialog open={showHsnDialog} onOpenChange={setShowHsnDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Search HSN Code</DialogTitle>
                      <DialogDescription>Search for HSN code and description</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search by HSN code or description..." 
                          value={hsnSearchQuery}
                          onChange={(e) => setHsnSearchQuery(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <ScrollArea className="h-[400px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>HSN Code</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {hsnResults.length > 0 ? (
                              hsnResults.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{item.hsnCode}</TableCell>
                                  <TableCell>{item.description}</TableCell>
                                  <TableCell>
                                    <Button size="sm" onClick={() => {
                                      updateCurrentItem('hsnCode', item.hsnCode);
                                      updateCurrentItem('description', item.description);
                                      setShowHsnDialog(false);
                                    }}>
                                      Select
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                  No results found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div>
              <Label>HSN Code *</Label>
              <Input 
                value={currentItem.hsnCode || ''} 
                onChange={(e) => updateCurrentItem('hsnCode', e.target.value)} 
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input 
                type="number" 
                value={currentItem.quantity || 1} 
                onChange={(e) => updateCurrentItem('quantity', Number(e.target.value))} 
              />
            </div>
            <div>
              <Label>Weight</Label>
              <Input 
                type="number" 
                step="0.001"
                value={currentItem.weight || 0} 
                onChange={(e) => updateCurrentItem('weight', Number(e.target.value))} 
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select 
                value={currentItem.unit || 'PCS'} 
                onValueChange={(v) => updateCurrentItem('unit', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PCS">PCS</SelectItem>
                  <SelectItem value="KGS">KGS</SelectItem>
                  <SelectItem value="LBS">LBS</SelectItem>
                  <SelectItem value="BOX">BOX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rate</Label>
              <Input 
                type="number" 
                step="0.01"
                value={currentItem.rate || 0} 
                onChange={(e) => updateCurrentItem('rate', Number(e.target.value))} 
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input 
                type="number" 
                value={currentItem.amount?.toFixed(2) || '0.00'} 
                disabled 
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addItem} className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
          
          {/* Summary Statistics */}
          <div className="flex justify-between items-center text-blue-600 font-semibold pt-2">
            <span>Total Record: {calculateTotals().totalRecords}</span>
            <span>Quantity: {calculateTotals().totalQuantity}</span>
            <span>Weight: {calculateTotals().totalWeight.toFixed(3)}</span>
            <span>Amount: {calculateTotals().totalAmount.toFixed(2)}</span>
          </div>

          {items.length > 0 && (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-600">
                    <TableHead className="text-white">Box No</TableHead>
                    <TableHead className="text-white">Package</TableHead>
                    <TableHead className="text-white">Description</TableHead>
                    <TableHead className="text-white">HS Code</TableHead>
                    <TableHead className="text-white">Quantity</TableHead>
                    <TableHead className="text-white">Weight</TableHead>
                    <TableHead className="text-white">Unit</TableHead>
                    <TableHead className="text-white">Rate</TableHead>
                    <TableHead className="text-white">Amount</TableHead>
                    <TableHead className="text-white">IGST %</TableHead>
                    <TableHead className="text-white">IGST Amount</TableHead>
                    <TableHead className="text-white">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.boxNo}</TableCell>
                      <TableCell>{item.packages}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                      <TableCell>{item.hsnCode}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.weight.toFixed(3)}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.rate.toFixed(2)}</TableCell>
                      <TableCell>{item.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          step="0.01"
                          value={item.igstPercent} 
                          onChange={(e) => {
                            const updated = [...items];
                            const igstPercent = parseFloat(e.target.value) || 0;
                            updated[index].igstPercent = igstPercent;
                            updated[index].igstAmount = (updated[index].amount * igstPercent) / 100;
                            setItems(updated);
                          }}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>{item.igstAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Country Code Search Dialog */}
      <Dialog open={showCountryDialog} onOpenChange={setShowCountryDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{countryField === 'consignee' ? 'Country' : 'Destination Country'}</DialogTitle>
            <DialogDescription>Search and select a country</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by country name or code..." 
                value={countrySearchQuery}
                onChange={(e) => setCountrySearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
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
            <div className="text-sm text-muted-foreground text-center">
              Showing {countryResults.length} of {countryCodes.length} countries
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vendor Search Dialog */}
      <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Vendor</DialogTitle>
            <DialogDescription>Search and select a vendor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by vendor name or code..." 
                value={vendorSearchQuery}
                onChange={(e) => setVendorSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorResults.length > 0 ? (
                    vendorResults.map((vendor, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{vendor.name}</TableCell>
                        <TableCell>{vendor.code}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => {
                            setServiceDetails(prev => ({ ...prev, vendor: vendor.name, vendorCode: vendor.code }));
                            setShowVendorDialog(false);
                          }}>
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No vendors found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            <div className="text-sm text-muted-foreground text-center">
              Showing {vendorResults.length} of {vendors.length} vendors
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Search Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Service</DialogTitle>
            <DialogDescription>Search and select a service</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by service name..." 
                value={serviceSearchQuery}
                onChange={(e) => setServiceSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Vendor Code</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceResults.length > 0 ? (
                    serviceResults.map((service, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.vendorCode}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => {
                            setServiceDetails(prev => ({ ...prev, service: service.name }));
                            setShowServiceDialog(false);
                          }}>
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        {serviceDetails.vendorCode ? 'No services found for this vendor' : 'Please select a vendor first'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            <div className="text-sm text-muted-foreground text-center">
              Showing {serviceResults.length} of {services.filter(s => !serviceDetails.vendorCode || s.vendorCode === serviceDetails.vendorCode).length} services
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Search Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Product</DialogTitle>
            <DialogDescription>Search and select a product</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by product name or code..." 
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productResults.length > 0 ? (
                    productResults.map((product, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.code}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => {
                            setServiceDetails(prev => ({ ...prev, product: product.name, productCode: product.code }));
                            setShowProductDialog(false);
                          }}>
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            <div className="text-sm text-muted-foreground text-center">
              Showing {productResults.length} of {products.length} products
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end gap-4">
        <Button onClick={generateAWB} size="lg" variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Generate AWB
        </Button>
        <Button onClick={generatePDF} size="lg">
          <FileDown className="mr-2 h-4 w-4" />
          Generate Invoice
        </Button>
      </div>

      {/* PDF Preview Dialog */}
      <PDFPreview
        open={pdfPreviewOpen}
        onOpenChange={setPdfPreviewOpen}
        pdfBlob={pdfBlob}
        fileName={pdfFileName}
        title={pdfTitle}
      />
    </div>
  );
};

export default InvoiceEntry;

