import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plane, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrack = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!trackingNumber.trim()) {
      return;
    }
    
    // Navigate to home page with tracking number in URL
    navigate(`/?track=${encodeURIComponent(trackingNumber.trim())}`);
    
    // Scroll to tracking section after navigation
    setTimeout(() => {
      const trackingSection = document.querySelector('[data-tracking-section]');
      if (trackingSection) {
        trackingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <header className="bg-white shadow-elegant border-b border-border/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <img 
              src="/VZlogo.png" 
              alt="Visakha International Couriers Logo" 
              className="h-12 md:h-14 w-auto object-contain max-w-[150px]"
              onError={(e) => {
                // Fallback if logo doesn't load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div 
              className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center"
              style={{ display: 'none' }}
            >
              <Plane className="text-white" size={24} />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-base md:text-lg font-bold text-foreground leading-tight">Visakha International Couriers</h1>
              <p className="text-xs text-muted-foreground">Shipping Worldwide with Trust & Speed</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-3 lg:gap-4 flex-shrink">
            <Link to="/" className="text-xs text-foreground hover:text-primary transition-colors whitespace-nowrap">Home</Link>
            <Link to="/about" className="text-xs text-foreground hover:text-primary transition-colors whitespace-nowrap">About</Link>
            <Link to="/services" className="text-xs text-foreground hover:text-primary transition-colors whitespace-nowrap">Services</Link>
            <Link to="/pricing" className="text-xs text-foreground hover:text-primary transition-colors whitespace-nowrap">Pricing</Link>
            <Link to="/locations" className="text-xs text-foreground hover:text-primary transition-colors whitespace-nowrap">Locations</Link>
            <Link to="/contact" className="text-xs text-foreground hover:text-primary transition-colors whitespace-nowrap">Contact</Link>
          </nav>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/admin/login?type=admin" className="hidden md:block">
              <Button variant="outline" size="sm" className="text-xs px-2 md:px-3">
                <User size={12} className="mr-1" />
                <span className="hidden lg:inline">Admin</span>
              </Button>
            </Link>
            <Link to="/admin/login?type=vendor" className="hidden md:block">
              <Button variant="outline" size="sm" className="text-xs px-2 md:px-3 bg-blue-50 hover:bg-blue-100 border-blue-200">
                <User size={12} className="mr-1" />
                <span className="hidden lg:inline">Vendor</span>
              </Button>
            </Link>
            
            {/* Tracking Input */}
            <form onSubmit={handleTrack} className="flex items-center gap-1 md:gap-2">
              <span className="font-bold text-foreground hidden xl:inline text-xs">TRACKING:</span>
              <Input
                type="text"
                placeholder="Track By AWB No:"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-32 md:w-40 lg:w-48 h-8 md:h-9 text-xs md:text-sm border-gray-300"
              />
              <Button 
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 md:px-4 h-8 md:h-9 text-xs md:text-sm"
              >
                GO
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
};