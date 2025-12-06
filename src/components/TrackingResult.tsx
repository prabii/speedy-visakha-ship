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
      <Card className="mt-6 bg-white/95 backdrop-blur-sm shadow-elegant">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-600">
            <XCircle className="h-5 w-5" />
            <p className="font-semibold">Tracking Error</p>
          </div>
          <p className="text-muted-foreground mt-2">{error}</p>
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
      <Card className="mt-6 bg-white/95 backdrop-blur-sm shadow-elegant">
        <CardHeader>
          <CardTitle className="text-xl text-red-600">
            Tracking / Reference Id {data.awbNo || waybill} Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sender and Recipient Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Section */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
                Sender
              </div>
              <div className="p-4">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Name</TableCell>
                      <TableCell>{data.shipper?.contactName || data.shipper?.companyName || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">City</TableCell>
                      <TableCell>{data.shipper?.city || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">State</TableCell>
                      <TableCell>{data.shipper?.state || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Pincode</TableCell>
                      <TableCell>{data.shipper?.pincode || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Country</TableCell>
                      <TableCell>{data.shipper?.country || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Recipient Section */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
                Recipient
              </div>
              <div className="p-4">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Name</TableCell>
                      <TableCell>{data.consignee?.contactName || data.consignee?.companyName || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">City</TableCell>
                      <TableCell>{data.consignee?.city || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">State</TableCell>
                      <TableCell>{data.consignee?.state || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Pincode</TableCell>
                      <TableCell>{data.consignee?.pincode || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Country</TableCell>
                      <TableCell>{data.consignee?.country || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Tracking History */}
          {data.trackingHistory && data.trackingHistory.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-blue-600 mb-4 text-center">Tracking History</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Date / Time</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.trackingHistory.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDateTime(entry.timestamp)}</TableCell>
                        <TableCell className="font-medium">{entry.status}</TableCell>
                        <TableCell>{entry.description || entry.location || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.ShipmentData || data.ShipmentData.length === 0) {
    return (
      <Card className="mt-6 bg-white/95 backdrop-blur-sm shadow-elegant">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-gray-600">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold">No tracking information found</p>
          </div>
          <p className="text-muted-foreground mt-2">
            No shipment found for waybill number: <strong>{waybill}</strong>
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
    <Card className="mt-6 bg-white/95 backdrop-blur-sm shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Tracking Information
          </CardTitle>
          {getStatusBadge(status?.StatusType || status?.Status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shipment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Waybill Number</p>
            <p className="font-semibold">{shipment.AWB || waybill}</p>
          </div>
          {shipment.Order && (
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-semibold">{shipment.Order}</p>
            </div>
          )}
          {shipment.Origin && (
            <div>
              <p className="text-sm text-muted-foreground">Origin</p>
              <p className="font-semibold">{shipment.Origin}</p>
            </div>
          )}
          {shipment.Destination && (
            <div>
              <p className="text-sm text-muted-foreground">Destination</p>
              <p className="font-semibold">{shipment.Destination}</p>
            </div>
          )}
          {shipment.PickUpDate && (
            <div>
              <p className="text-sm text-muted-foreground">Pickup Date</p>
              <p className="font-semibold">
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
              <p className="text-sm text-muted-foreground">Expected Delivery</p>
              <p className="font-semibold">
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
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Current Status
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold text-blue-900">{status.Status || status.StatusType}</p>
              {status.StatusLocation && (
                <p className="text-sm text-blue-700 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {status.StatusLocation}
                </p>
              )}
              {status.StatusDateTime && (
                <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
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
                <p className="text-sm text-blue-800 mt-2">{status.Instructions}</p>
              )}
            </div>
          </div>
        )}

        {/* Tracking History */}
        {sortedScans.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Tracking History</h3>
            <div className="space-y-3">
              {sortedScans.map((scanDetail, index) => {
                if (!scanDetail) return null;
                
                return (
                  <div key={index} className="flex gap-4 pb-3 border-b last:border-0">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{scanDetail.ScanType || scanDetail.Status}</p>
                      {scanDetail.ScannedLocation && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {scanDetail.ScannedLocation}
                        </p>
                      )}
                      {scanDetail.ScanDateTime && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {(() => {
                            try {
                              return new Date(scanDetail.ScanDateTime).toLocaleString();
                            } catch {
                              return scanDetail.ScanDateTime;
                            }
                          })()}
                        </p>
                      )}
                      {scanDetail.Instructions && (
                        <p className="text-sm text-muted-foreground mt-1">{scanDetail.Instructions}</p>
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
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Delivery Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">{shipment.Consignee.Name}</p>
              {shipment.Consignee.Address && (
                <p className="text-sm text-muted-foreground mt-1">{shipment.Consignee.Address}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {shipment.Consignee.City}
                {shipment.Consignee.State && `, ${shipment.Consignee.State}`}
                {shipment.Consignee.PinCode && ` - ${shipment.Consignee.PinCode}`}
              </p>
              {shipment.Consignee.Mobile && (
                <p className="text-sm text-muted-foreground mt-1">Mobile: {shipment.Consignee.Mobile}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
