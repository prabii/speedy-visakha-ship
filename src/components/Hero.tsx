import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Package, Globe, X } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { TrackingResult } from "./TrackingResult";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/ChatGPT Image Jan 26, 2026, 12_24_50 PM.png";

const DELHIVERY_API_KEY = "3fa572f5b2e80d1267e936d28dccacd86d24a700";
const DELHIVERY_API_URL = "https://track.delhivery.com/api/v1/packages/json/";

export const Hero = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const closeTracking = () => {
    setTrackingData(null);
    setError(null);
    setTrackingNumber("");
    // Remove track parameter from URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('track');
    navigate(`/?${newSearchParams.toString()}`, { replace: true });
  };

  // Check for tracking number in URL on mount
  useEffect(() => {
    const trackParam = searchParams.get('track');
    if (trackParam) {
      setTrackingNumber(trackParam);
      // Auto-track after a short delay to ensure component is ready
      setTimeout(() => {
        handleTrackWithNumber(trackParam);
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTrackWithNumber = async (awbNo: string) => {
    if (!awbNo.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      // First, try to get tracking from our database
      const api = (await import('@/lib/api')).default;
      try {
        const dbData = await api.awb.track(awbNo.trim());
        if (dbData && dbData.awbNo) {
          // Format data for our TrackingResult component
          setTrackingData({
            fromDatabase: true,
            awbNo: dbData.awbNo,
            status: dbData.status,
            origin: dbData.origin,
            destination: dbData.destination,
            bookingDate: dbData.bookingDate,
            shipper: dbData.shipper || null,
            consignee: dbData.consignee || null,
            trackingHistory: dbData.trackingHistory || []
          });
          setIsLoading(false);
          return;
        }
      } catch (dbError: any) {
        // If not found in database, try Delhivery API
        console.log('AWB not found in database, trying Delhivery API');
      }

      // Fallback to Delhivery API
      const url = `${DELHIVERY_API_URL}?waybill=${encodeURIComponent(awbNo.trim())}&ref_ids=`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Token ${DELHIVERY_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Tracking failed: ${response.statusText}`);
      }

      const data = await response.json();
      setTrackingData(data);
      
      if (!data.ShipmentData || data.ShipmentData.length === 0) {
        setError("No shipment found for this tracking number");
      }
    } catch (err: any) {
      setError(err.message || "Failed to track shipment. Please try again.");
      toast({
        title: "Tracking Error",
        description: err.message || "Failed to track shipment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        {/* Background image with lighter overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/20"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center space-y-6" data-tracking-section>
            {/* Content hidden */}
          </div>
        </div>
      </section>

      {/* Tracking Results Section - Outside hero section */}
      {(trackingData || error) && (
        <section className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-foreground">Tracking Details</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeTracking}
                  className="flex items-center gap-2"
                >
                  <X size={16} />
                  Close
                </Button>
              </div>
              <TrackingResult 
                data={trackingData} 
                error={error || undefined} 
                waybill={trackingNumber}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
};