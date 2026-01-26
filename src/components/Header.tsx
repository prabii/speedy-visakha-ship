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
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/VZlogo.png" 
              alt="Visakha International Couriers Logo" 
              className="h-14 md:h-16 w-auto object-contain max-w-[200px]"
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
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight">Visakha International Couriers</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Shipping Worldwide with Trust & Speed</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">About</Link>
            <Link to="/services" className="text-foreground hover:text-primary transition-colors">Services</Link>
            <Link to="/pricing" className="text-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link to="/locations" className="text-foreground hover:text-primary transition-colors">Locations</Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">Contact</Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link to="/admin/login" className="hidden md:block">
              <Button variant="outline" size="sm">
                <User size={16} />
                Admin
              </Button>
            </Link>
            
            {/* Tracking Input */}
            <form onSubmit={handleTrack} className="flex items-center gap-2">
              <span className="font-bold text-foreground hidden lg:inline">TRACKING:</span>
              <Input
                type="text"
                placeholder="Track By AWB No:"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-48 md:w-56 h-9 text-sm border-gray-300"
              />
              <Button 
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 h-9"
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