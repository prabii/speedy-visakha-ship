import { Button } from "@/components/ui/button";
import { Plane, User } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="bg-white shadow-elegant border-b border-border/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Plane className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Visakha International Couriers</h1>
              <p className="text-sm text-muted-foreground">Shipping Worldwide with Trust & Speed</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">About</Link>
            <Link to="/services" className="text-foreground hover:text-primary transition-colors">Services</Link>
            <Link to="/pricing" className="text-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">Contact</Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <User size={16} />
              Login
            </Button>
            <Button variant="hero" size="lg">
              Track Package
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};