import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye, ChevronLeft, ChevronRight, FileText, Package, Trash2, Edit } from 'lucide-react';
import { PDFPreview } from './PDFPreview';
import { useToast } from '@/hooks/use-toast';
import { generateInvoicePDF, generateAWBPDF } from '@/lib/pdfGenerator';
import type { InvoiceData, AWBData } from '@/lib/pdfGenerator';
import api from '@/lib/api';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Invoice {
  _id: string;
  invoiceNo: string;
  invoiceDate: string;
  awbNo?: string;
  totalAmount: number;
  status: string;
  shipper: {
    companyName: string;
  };
  consignee: {
    companyName: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    amount: number;
  }>;
}

interface AWB {
  _id: string;
  awbNo: string;
  accountNo: string;
  customer: string;
  origin: string;
  destination: string;
  service: string;
  bookingDate: string;
  invoiceNo?: string;
  status: string;
  shipper: {
    companyName: string;
  };
  consignee: {
    companyName: string;
  };
  pieces: string;
  weight: string;
  shipmentValue: string;
}

type HistoryItem = {
  type: 'invoice' | 'awb';
  id: string;
  date: string;
  documentNo: string;
  awbNo?: string;
  invoiceNo?: string;
  shipper: string;
  consignee: string;
  amount?: number;
  status: string;
  data: Invoice | AWB;
};

const InvoiceHistory = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();
  const { user, isVendor, isAdmin } = useAuth();
  
  // PDF Preview State
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');
  
  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<HistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Prepare params with vendor filtering
      const invoiceParams: any = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
      };
      const awbParams: any = {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
      };
      
      // If vendor, only show their invoices and AWBs
      if (isVendor() && user?._id) {
        invoiceParams.vendorId = user._id;
        invoiceParams.userRole = 'vendor';
        awbParams.vendorId = user._id;
        awbParams.userRole = 'vendor';
      } else if (isAdmin()) {
        invoiceParams.userRole = 'admin';
        awbParams.userRole = 'admin';
      }
      
      // Fetch both invoices and AWBs in parallel
      const [invoicesData, awbsData] = await Promise.all([
        api.invoices.getAll(invoiceParams).catch(() => ({ invoices: [], totalPages: 1, total: 0 })),
        api.awb.getAll(awbParams).catch(() => ({ awbs: [], totalPages: 1, total: 0 })),
      ]);
      
      // Combine and sort by date (newest first)
      const invoiceItems: HistoryItem[] = (invoicesData.invoices || []).map((inv: Invoice) => ({
        type: 'invoice' as const,
        id: inv._id,
        date: inv.invoiceDate,
        documentNo: inv.invoiceNo,
        awbNo: inv.awbNo,
        invoiceNo: inv.invoiceNo,
        shipper: inv.shipper?.companyName || '-',
        consignee: inv.consignee?.companyName || '-',
        amount: inv.totalAmount,
        status: inv.status,
        data: inv,
      }));
      
      const awbItems: HistoryItem[] = (awbsData.awbs || []).map((awb: AWB) => ({
        type: 'awb' as const,
        id: awb._id,
        date: awb.bookingDate,
        documentNo: awb.awbNo,
        awbNo: awb.awbNo,
        invoiceNo: awb.invoiceNo,
        shipper: awb.shipper?.companyName || '-',
        consignee: awb.consignee?.companyName || '-',
        status: awb.status,
        data: awb,
      }));
      
      // Combine and sort by date
      const combined = [...invoiceItems, ...awbItems].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setItems(combined);
      // Use the larger total for pagination
      const maxTotal = Math.max(invoicesData.total || 0, awbsData.total || 0);
      setTotal(maxTotal);
      setTotalPages(Math.max(invoicesData.totalPages || 1, awbsData.totalPages || 1));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load history. Make sure the backend server is running.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const generatePDFData = async (item: HistoryItem): Promise<{ blob: Blob; fileName: string; title: string } | null> => {
    try {
      if (item.type === 'invoice') {
        const invoice = item.data as Invoice;
        // Convert invoice to InvoiceData format
        const invoiceData: InvoiceData = {
          invoiceNo: invoice.invoiceNo,
          invoiceDate: invoice.invoiceDate,
          exporterRef: '',
          awbNo: invoice.awbNo,
          pieces: invoice.items.reduce((sum, item) => sum + item.quantity, 0).toString(),
          shipper: invoice.shipper as any,
          consignee: invoice.consignee as any,
          placeOfLoading: '',
          countryOfOrigin: '',
          portOfDischarge: '',
          finalDestination: '',
          countryOfDestination: '',
          items: invoice.items.map(item => ({
            boxNo: '1',
            description: item.description,
            hsnCode: '',
            quantity: item.quantity,
            weight: 0,
            rate: item.amount / item.quantity,
            amount: item.amount,
          })),
          totalAmount: invoice.totalAmount,
        };

        const pdfBlob = await generateInvoicePDF(invoiceData);
        return {
          blob: pdfBlob,
          fileName: `Invoice_${invoice.invoiceNo}.pdf`,
          title: 'Invoice Preview'
        };
      } else {
        const awb = item.data as AWB;
        // Convert AWB to AWBData format
        const awbData: AWBData = {
          awbNo: awb.awbNo,
          accountNo: awb.accountNo,
          customer: awb.customer,
          origin: awb.origin,
          destination: awb.destination,
          service: awb.service,
          bookingDate: awb.bookingDate 
            ? format(new Date(awb.bookingDate), 'dd/MM/yyyy HH:mm')
            : format(new Date(), 'dd/MM/yyyy HH:mm'),
          companyName: 'VISAKHA INTERNATIONAL COURIERS',
          website: 'WWW.VISAKHACOURIERS.COM',
          email: 'INFO@VISAKHACOURIERS.COM',
          shipper: awb.shipper as any,
          consignee: awb.consignee as any,
          description: '',
          pieces: awb.pieces,
          weight: awb.weight,
          chargeableWeight: awb.weight,
          shipmentValue: awb.shipmentValue || '0',
          paymentMethod: 'TOPAY',
          invoiceNo: awb.invoiceNo,
          gstNo: '37HVGPP7046R1ZG',
        };

        const pdfBlob = await generateAWBPDF(awbData);
        return {
          blob: pdfBlob,
          fileName: `AWB_${awb.awbNo}.pdf`,
          title: 'AWB Preview'
        };
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handlePreviewPDF = async (item: HistoryItem) => {
    const pdfData = await generatePDFData(item);
    if (pdfData) {
      setPdfBlob(pdfData.blob);
      setPdfFileName(pdfData.fileName);
      setPdfTitle(pdfData.title);
      setPdfPreviewOpen(true);
    }
  };

  const handleDownloadPDF = async (item: HistoryItem) => {
    const pdfData = await generatePDFData(item);
    if (pdfData) {
      // Direct download without preview
      const url = URL.createObjectURL(pdfData.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'PDF downloaded successfully',
      });
    }
  };

  const handleDeleteClick = (item: HistoryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      if (itemToDelete.type === 'invoice') {
        await api.invoices.delete(itemToDelete.id);
        toast({
          title: 'Success',
          description: 'Invoice deleted successfully',
        });
      } else {
        await api.awb.delete(itemToDelete.id);
        toast({
          title: 'Success',
          description: 'AWB deleted successfully',
        });
      }

      // Refresh the data
      await fetchData();
      
      // Close dialog
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete item',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditInvoice = async (item: HistoryItem) => {
    if (item.type !== 'invoice') return;
    
    try {
      // Fetch full invoice data
      const invoiceData = await api.invoices.getById(item.id);
      
      // Store invoice data in localStorage for editing
      localStorage.setItem('edit_invoice_data', JSON.stringify(invoiceData));
      
      // Navigate to invoice tab by triggering a custom event
      window.dispatchEvent(new CustomEvent('navigateToInvoiceTab'));
      
      toast({
        title: 'Success',
        description: 'Invoice loaded for editing. Please go to Invoice Entry tab.',
      });
    } catch (error: any) {
      console.error('Error loading invoice for edit:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load invoice for editing',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      // Invoice statuses
      draft: { variant: 'outline', label: 'Draft' },
      issued: { variant: 'default', label: 'Issued' },
      paid: { variant: 'secondary', label: 'Paid' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      // AWB statuses
      pending: { variant: 'outline', label: 'Pending' },
      in_transit: { variant: 'default', label: 'In Transit' },
      out_for_delivery: { variant: 'secondary', label: 'Out for Delivery' },
      delivered: { variant: 'secondary', label: 'Delivered' },
      returned: { variant: 'destructive', label: 'Returned' },
    };

    const config = statusConfig[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div>
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          Invoice & AWB History
        </CardTitle>
        <CardDescription>View and manage all generated invoices and AWBs</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by invoice number, AWB number, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} variant="default">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {/* Combined Invoice & AWB Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No records found</p>
            <p className="text-muted-foreground text-sm mt-2">
              {searchQuery ? 'Try a different search term' : 'Start creating invoices and AWBs to see them here'}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Document No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>AWB No.</TableHead>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Shipper</TableHead>
                    <TableHead>Consignee</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={`${item.type}-${item.id}`}>
                      <TableCell>
                        <Badge variant={item.type === 'invoice' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                          {item.type === 'invoice' ? (
                            <FileText className="h-3 w-3" />
                          ) : (
                            <Package className="h-3 w-3" />
                          )}
                          {item.type === 'invoice' ? 'Invoice' : 'AWB'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.documentNo}</TableCell>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>{item.awbNo || '-'}</TableCell>
                      <TableCell>{item.invoiceNo || '-'}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {item.shipper}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {item.consignee}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {item.amount ? formatCurrency(item.amount) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.type === 'invoice' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditInvoice(item)}
                              title="Edit Invoice"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewPDF(item)}
                            title="Preview PDF"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(item)}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                            title="Delete"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, items.length)} of {items.length} records
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>

    {/* PDF Preview Dialog */}
    <PDFPreview
      open={pdfPreviewOpen}
      onOpenChange={setPdfPreviewOpen}
      pdfBlob={pdfBlob}
      fileName={pdfFileName}
      title={pdfTitle}
    />

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the{' '}
            <strong>{itemToDelete?.type === 'invoice' ? 'invoice' : 'AWB'}</strong>{' '}
            <strong>{itemToDelete?.documentNo}</strong> from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  );
};

export default InvoiceHistory;
