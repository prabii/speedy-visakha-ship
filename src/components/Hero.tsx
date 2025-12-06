import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Package, Globe, Clock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-logistics.jpg";
import { TrackingResult } from "./TrackingResult";
import { useToast } from "@/hooks/use-toast";

const DELHIVERY_API_KEY = "3fa572f5b2e80d1267e936d28dccacd86d24a700";
const DELHIVERY_API_URL = "https://track.delhivery.com/api/v1/packages/json/";

export const Hero = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const url = `${DELHIVERY_API_URL}?waybill=${encodeURIComponent(trackingNumber.trim())}&ref_ids=`;
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTrack();
    }
  };

  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white" data-tracking-section>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            Shipping Worldwide with <br />
            <span className="text-secondary">Trust & Speed</span>
          </h1>
          
          <p className="text-xl mb-8 opacity-90">
            One stop solution for all your international logistics needs
          </p>

          {/* Tracking section */}
          <Card className="bg-white/95 backdrop-blur-sm p-6 mb-8 shadow-elegant">
            <h3 className="text-foreground text-lg font-semibold mb-4">Track Your Shipment</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter waybill number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 text-lg"
                  disabled={isLoading}
                />
              </div>
              <Button 
                variant="track" 
                size="lg" 
                className="h-12 px-8"
                onClick={handleTrack}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="mr-2" size={20} />
                    Track Now
                  </>
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              Enter waybill number to track your shipment
            </p>
          </Card>

          {/* Tracking Results */}
          {(trackingData || error) && (
            <TrackingResult 
              data={trackingData} 
              error={error || undefined} 
              waybill={trackingNumber}
            />
          )}

          {/* Quick actions */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/book-shipment">
              <Button variant="hero" size="lg" className="h-14 px-8">
                <Package className="mr-2" size={20} />
                Book Shipment
              </Button>
            </Link>
            <Link to="/rate-calculator">
              <Button variant="secondary" size="lg" className="h-14 px-8">
                <Globe className="mr-2" size={20} />
                Rate Calculator
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="flex items-center justify-center gap-3 text-white/90">
              <Clock size={24} />
              <span className="text-lg">Fast & Reliable</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/90">
              <Package size={24} />
              <span className="text-lg">Secure Handling</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/90">
              <Globe size={24} />
              <span className="text-lg">Worldwide Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};