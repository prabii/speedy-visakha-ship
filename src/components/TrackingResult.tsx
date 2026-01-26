import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ScanDetail {
  ScanType?: string;
  ScanDateTime?: string;
  ScannedLocation?: string;
  Instructions?: string;
  Status?: string;
}

interface TrackingData {
  fromDatabase?: boolean;
  awbNo?: string;
  status?: string;
  origin?: string;
  destination?: string;
  bookingDate?: string;
  shipper?: {
    companyName?: string;
    contactName?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    address1?: string;
    address2?: string;
  };
  consignee?: {
    companyName?: string;
    contactName?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    address1?: string;
    address2?: string;
  };
  trackingHistory?: Array<{
    status: string;
    location?: string;
    description?: string;
    timestamp: string | Date;
    updatedBy?: string;
  }>;
  ShipmentData?: Array<{
    Shipment?: {
      AWB?: string;
      Order?: string;
      Status?: {
        Status?: string;
        StatusLocation?: string;
        StatusDateTime?: string;
        Instructions?: string;
        StatusType?: string;
      };
      Scans?: {
        ScanDetail?: ScanDetail[];
      };
      Origin?: string;
      Destination?: string;
      Consignee?: {
        Name?: string;
        Address?: string;
        City?: string;
        State?: string;
        PinCode?: string;
        Mobile?: string;
      };
      PickUpDate?: string;
      ExpectedDate?: string;
    };
  }>;
}

interface TrackingResultProps {
  data: TrackingData | null;
  error?: string;
  waybill: string;
}

export const TrackingResult = ({ data, error, waybill }: TrackingResultProps) => {
  if (error) {
    return (
      <Card className="bg-white shadow-lg border border-red-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 text-red-600">
            <XCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-semibold text-sm sm:text-base">Tracking Error</p>
          </div>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Handle database format
  if (data?.fromDatabase) {
    const formatDateTime = (date: string | Date | undefined) => {
      if (!date) return '';
      try {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } catch {
        return String(date);
      }
    };

    return (
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-lg sm:text-xl text-blue-600">
            Tracking / Reference Id: <span className="font-mono">{data.awbNo || waybill}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Sender and Recipient Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Sender Section */}
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="bg-blue-600 text-white px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base">
                Sender
              </div>
              <div className="p-3 sm:p-4">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-2 border-b">
                    <span className="font-medium text-sm sm:text-base text-gray-600 min-w-[80px]">Name:</span>
                    <span className="text-sm sm:text-base">{data.shipper?.contactName || data.shipper?.companyName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-2 border-b">
                    <span className="font-medium text-sm sm:text-base text-gray-600 min-w-[80px]">City:</span>
                    <span className="text-sm sm:text-base">{data.shipper?.city || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-2 border-b">
                    <span className="font-medium text-sm sm:text-base text-gray-600 min-w-[80px]">State:</span>
                    <span className="text-sm sm:text-base">{data.shipper?.state || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-2 border-b">
                    <span className="font-medium text-sm sm:text-base text-gray-600 min-w-[80px]">Pincode:</span>
                    <span className="text-sm sm:text-base">{data.shipper?.pincode || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-2">
                    <span className="font-medium text-sm sm:text-base text-gray-600 min-w-[80px]">Country:</span>
                    <span className="text-sm sm:text-base">{data.shipper?.country || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipient Section */}
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="bg-blue-600 text-white px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base">
                Recipient
              </div>
              <div className="p-3 sm:p-4">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-2 border-b">
                    <span className="font-medium text-sm sm:text-base text-gray-600 min-w-[80px]">Name:</span>
                    <span className="text-sm sm:text-base">{data.consignee?.contactName || data.consignee?.companyName || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-2 border-b">
                    <span className="font-medium text-sm sm:text-base text-gray-600 min-w-[80px]">City:</span>
                    <span className="text-sm sm:text-base">{data.consignee?.city || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-2 border-b">
                    <span className="font-medium text-sm sm:text-base text-gray-600 min-w-[80px]">State:</span>
                    <span className="text-sm sm:text-base">{data.consignee?.state || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-2 border-b">
                    <span className="font-medium text-sm sm:text-base text-gray-600 min-w-[80px]">Pincode:</span>
                    <span className="text-sm sm:text-base">{data.consignee?.pincode || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-2">
                    <span className="font-medium text-sm sm:text-base text-gray-600 min-w-[80px]">Country:</span>
                    <span className="text-sm sm:text-base">{data.consignee?.country || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking History */}
          {data.trackingHistory && data.trackingHistory.length > 0 && (
            <div className="border-t pt-4 sm:pt-6">
              <h3 className="text-base sm:text-lg font-semibold text-blue-600 mb-4 text-center">Tracking History</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-xs sm:text-sm">Date / Time</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm">Remark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.trackingHistory.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs sm:text-sm whitespace-nowrap">{formatDateTime(entry.timestamp)}</TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm">{entry.status}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{entry.description || entry.location || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.ShipmentData || data.ShipmentData.length === 0) {
    return (
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 text-gray-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-semibold text-sm sm:text-base">No tracking information found</p>
          </div>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            No shipment found for waybill number: <strong className="font-mono">{waybill}</strong>
          </p>
        </CardContent>
      </Card>
    );
  }

  const shipment = data.ShipmentData[0]?.Shipment;
  if (!shipment) {
    return null;
  }

  const status = shipment.Status;
  const scans = shipment.Scans?.ScanDetail || [];
  const sortedScans = [...scans].sort((a, b) => {
    const dateA = a.ScanDateTime || '';
    const dateB = b.ScanDateTime || '';
    return dateB.localeCompare(dateA);
  });

  const getStatusBadge = (statusType?: string) => {
    if (!statusType) return null;
    
    const statusLower = statusType.toLowerCase();
    if (statusLower.includes('delivered')) {
      return <Badge className="bg-green-500">Delivered</Badge>;
    } else if (statusLower.includes('out for delivery') || statusLower.includes('out_for_delivery')) {
      return <Badge className="bg-blue-500">Out for Delivery</Badge>;
    } else if (statusLower.includes('in transit') || statusLower.includes('in_transit')) {
      return <Badge className="bg-yellow-500">In Transit</Badge>;
    } else if (statusLower.includes('pending') || statusLower.includes('pickup')) {
      return <Badge className="bg-gray-500">Pending</Badge>;
    }
    return <Badge>{statusType}</Badge>;
  };

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
            <Package className="h-5 w-5" />
            Tracking Information
          </CardTitle>
          {getStatusBadge(status?.StatusType || status?.Status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Shipment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Waybill Number</p>
            <p className="font-semibold text-sm sm:text-base font-mono">{shipment.AWB || waybill}</p>
          </div>
          {shipment.Order && (
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Order ID</p>
              <p className="font-semibold text-sm sm:text-base">{shipment.Order}</p>
            </div>
          )}
          {shipment.Origin && (
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Origin</p>
              <p className="font-semibold text-sm sm:text-base">{shipment.Origin}</p>
            </div>
          )}
          {shipment.Destination && (
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Destination</p>
              <p className="font-semibold text-sm sm:text-base">{shipment.Destination}</p>
            </div>
          )}
          {shipment.PickUpDate && (
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Pickup Date</p>
              <p className="font-semibold text-sm sm:text-base">
                {(() => {
                  try {
                    return new Date(shipment.PickUpDate).toLocaleDateString();
                  } catch {
                    return shipment.PickUpDate;
                  }
                })()}
              </p>
            </div>
          )}
          {shipment.ExpectedDate && (
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Expected Delivery</p>
              <p className="font-semibold text-sm sm:text-base">
                {(() => {
                  try {
                    return new Date(shipment.ExpectedDate).toLocaleDateString();
                  } catch {
                    return shipment.ExpectedDate;
                  }
                })()}
              </p>
            </div>
          )}
        </div>

        {/* Current Status */}
        {status && (
          <div className="border-t pt-3 sm:pt-4">
            <h3 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              Current Status
            </h3>
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <p className="font-semibold text-blue-900 text-sm sm:text-base">{status.Status || status.StatusType}</p>
              {status.StatusLocation && (
                <p className="text-xs sm:text-sm text-blue-700 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  {status.StatusLocation}
                </p>
              )}
              {status.StatusDateTime && (
                <p className="text-xs sm:text-sm text-blue-600 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  {(() => {
                    try {
                      return new Date(status.StatusDateTime).toLocaleString();
                    } catch {
                      return status.StatusDateTime;
                    }
                  })()}
                </p>
              )}
              {status.Instructions && (
                <p className="text-xs sm:text-sm text-blue-800 mt-2">{status.Instructions}</p>
              )}
            </div>
          </div>
        )}

        {/* Tracking History */}
        {sortedScans.length > 0 && (
          <div className="border-t pt-3 sm:pt-4">
            <h3 className="font-semibold text-sm sm:text-base mb-3">Tracking History</h3>
            <div className="space-y-3">
              {sortedScans.map((scanDetail, index) => {
                if (!scanDetail) return null;
                
                return (
                  <div key={index} className="flex gap-3 sm:gap-4 pb-3 border-b last:border-0">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base">{scanDetail.ScanType || scanDetail.Status}</p>
                      {scanDetail.ScannedLocation && (
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="break-words">{scanDetail.ScannedLocation}</span>
                        </p>
                      )}
                      {scanDetail.ScanDateTime && (
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="break-words">
                            {(() => {
                              try {
                                return new Date(scanDetail.ScanDateTime).toLocaleString();
                              } catch {
                                return scanDetail.ScanDateTime;
                              }
                            })()}
                          </span>
                        </p>
                      )}
                      {scanDetail.Instructions && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{scanDetail.Instructions}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Consignee Details */}
        {shipment.Consignee && (
          <div className="border-t pt-3 sm:pt-4">
            <h3 className="font-semibold text-sm sm:text-base mb-3">Delivery Address</h3>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <p className="font-semibold text-sm sm:text-base">{shipment.Consignee.Name}</p>
              {shipment.Consignee.Address && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{shipment.Consignee.Address}</p>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground">
                {shipment.Consignee.City}
                {shipment.Consignee.State && `, ${shipment.Consignee.State}`}
                {shipment.Consignee.PinCode && ` - ${shipment.Consignee.PinCode}`}
              </p>
              {shipment.Consignee.Mobile && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Mobile: {shipment.Consignee.Mobile}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
