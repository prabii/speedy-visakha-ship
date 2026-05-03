import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Plane, User, Menu, Search } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTrack = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!trackingNumber.trim()) return;
    navigate(`/?track=${encodeURIComponent(trackingNumber.trim())}`);
    setTimeout(() => {
      document.querySelector('[data-tracking-section]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      {/* Top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500" />

      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0">
            <img
              src="/VZlogo.png"
              alt="Visakha International Couriers"
              className="h-10 md:h-12 w-auto object-contain max-w-[140px] md:max-w-[170px]"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = 'none';
                (t.nextElementSibling as HTMLElement).style.display = 'flex';
              }}
            />
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md" style={{ display: 'none' }}>
              <Plane className="text-white" size={22} />
            </div>
          </Link>

          {/* Right: nav + actions */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5 mr-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(link.to)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-gray-200" />

            {/* Admin / Vendor */}
            <Link to="/admin/login?type=admin" className="hidden md:block">
              <Button variant="outline" size="sm" className="h-8 text-xs px-3 border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 gap-1">
                <User size={12} />
                <span className="hidden lg:inline">Admin</span>
              </Button>
            </Link>
            <Link to="/admin/login?type=vendor" className="hidden md:block">
              <Button size="sm" className="h-8 text-xs px-3 bg-blue-600 hover:bg-blue-700 text-white gap-1">
                <User size={12} />
                <span className="hidden lg:inline">Vendor</span>
              </Button>
            </Link>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-gray-200" />

            {/* Tracking */}
            <form onSubmit={handleTrack} className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
              <Search size={13} className="text-gray-400 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Track AWB No"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-28 md:w-36 lg:w-44 h-6 border-0 bg-transparent text-xs p-0 shadow-none focus-visible:ring-0"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded-md transition-colors flex-shrink-0"
              >
                GO
              </button>
            </form>

            {/* Mobile Hamburger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden h-8 w-8 p-0 border-gray-200">
                  <Menu size={17} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-8">
                <div className="mb-4 px-3">
                  <form onSubmit={(e) => { handleTrack(e); setMobileMenuOpen(false); }} className="flex gap-2">
                    <Input
                      placeholder="Track AWB No"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="h-9 text-sm flex-1"
                    />
                    <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 h-9 px-3">GO</Button>
                  </form>
                </div>
                <nav className="flex flex-col gap-0.5">
                  {navLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`text-sm font-medium rounded-lg px-3 py-2.5 transition-colors ${
                        isActive(link.to) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t my-3" />
                  <Link to="/admin/login?type=admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2 mb-2">
                      <User size={14} /> Admin Login
                    </Button>
                  </Link>
                  <Link to="/admin/login?type=vendor" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700">
                      <User size={14} /> Vendor Login
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