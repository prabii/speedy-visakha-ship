import { Link } from "react-router-dom";
import { Mail, Globe, MapPin, Phone } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-bold mb-4">VISAKHA INTERNATIONAL COURIERS</h3>
            <p className="text-sm">INTERNATIONAL, DOMESTIC COURIERS & CARGO</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <a 
                  href="https://visakhacouriers.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  WWW.VISAKHACOURIERS.IN
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a 
                  href="mailto:info@visakhacouriers.com" 
                  className="text-sm hover:text-white transition-colors"
                >
                  INFO@VISAKHACOURIERS.COM
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/book-shipment" className="text-sm hover:text-white transition-colors">
                  Book Shipment
                </Link>
              </li>
              <li>
                <Link to="/rate-calculator" className="text-sm hover:text-white transition-colors">
                  Rate Calculator
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  Track Package
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  International Shipping
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  Domestic Shipping
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-sm">
                  7-17-7/2, Opp. Redcherry Bakery<br />
                  Old Gajuwaka, Visakhapatnam - 530026<br />
                  Andhra Pradesh, India
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-sm">
                  +91-XXXXXXXXXX
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                <a 
                  href="mailto:info@visakhacouriers.com" 
                  className="text-sm hover:text-white transition-colors"
                >
                  info@visakhacouriers.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-center md:text-left">
              © {currentYear} Visakha International Couriers. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

