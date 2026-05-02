import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Plane, User, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/pricing", label: "Pricing" },
    { to: "/gallery", label: "Gallery" },
    { to: "/locations", label: "Locations" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="bg-white shadow-elegant border-b border-border/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <img
              src="/VZlogo.png"
              alt="Visakha International Couriers Logo"
              className="h-10 md:h-12 w-auto object-contain max-w-[140px] md:max-w-[180px]"
              onError={(e) => {
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
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-4 flex-shrink">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="text-sm text-foreground hover:text-primary transition-colors whitespace-nowrap">{link.label}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
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
            <form onSubmit={handleTrack} className="flex items-center gap-1">
              <span className="font-bold text-foreground hidden xl:inline text-xs">TRACKING:</span>
              <Input
                type="text"
                placeholder="AWB No"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-24 sm:w-32 md:w-40 lg:w-48 h-8 md:h-9 text-xs md:text-sm border-gray-300"
              />
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 md:px-4 h-8 md:h-9 text-xs md:text-sm"
              >
                GO
              </Button>
            </form>

            {/* Mobile Hamburger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden h-8 w-8 p-0 flex-shrink-0">
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-10">
                <nav className="flex flex-col gap-1">
                  {navLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md px-3 py-2 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t my-3" />
                  <Link to="/admin/login?type=admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <User size={14} />
                      Admin Login
                    </Button>
                  </Link>
                  <Link to="/admin/login?type=vendor" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200">
                      <User size={14} />
                      Vendor Login
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};