import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-border">
      {/* Top contact bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <span>+91 832 853 8901</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span>info@visakhainter.com</span>
              </div>
            </div>
            <div className="text-xs">
              7-17-7/2, Opp. Redcherry Bakery, Old Gajuwaka, Visakhapatnam - 530026
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-primary">
              VISAKHA <span className="text-secondary">INTERNATIONAL</span>
            </div>
            <div className="ml-2 text-xs text-muted-foreground">COURIERS</div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
            <a href="#services" className="text-foreground hover:text-primary transition-colors">Services</a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline">Track Shipment</Button>
            <Button variant="secondary">Get Quote</Button>
          </div>
        </div>
      </nav>
    </header>
  );
};