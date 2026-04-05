import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  FileText, 
  Plane, 
  Truck, 
  Ship, 
  Shield,
  Clock,
  Globe
} from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: FileText,
      title: "Document Courier",
      description: "Fast and secure delivery of important documents worldwide with real-time tracking.",
      features: ["Express delivery", "Secure handling", "Digital tracking", "Door-to-door"]
    },
    {
      icon: Package,
      title: "Parcel Services",
      description: "Reliable parcel delivery services for packages of all sizes to international destinations.",
      features: ["All sizes accepted", "Insurance included", "Customs clearance", "Global network"]
    },
    {
      icon: Plane,
      title: "Air Freight",
      description: "Fast air freight services for urgent shipments with priority handling and tracking.",
      features: ["Fastest delivery", "Priority handling", "Real-time updates", "Secure packaging"]
    },
    {
      icon: Ship,
      title: "Sea Freight",
      description: "Cost-effective sea freight solutions for large and heavy shipments worldwide.",
      features: ["Cost effective", "Large capacity", "Containerized shipping", "Port-to-port"]
    },
    {
      icon: Truck,
      title: "Road Transport",
      description: "Reliable road transport services for domestic and cross-border deliveries.",
      features: ["Domestic delivery", "Cross-border", "Scheduled routes", "Cargo tracking"]
    },
    {
      icon: Package,
      title: "Excess Baggage",
      description: "Convenient excess baggage services for travelers with competitive rates.",
      features: ["Travel friendly", "Airport pickup", "Competitive rates", "Quick processing"]
    }
  ];

  const partners = [
    { name: "UPS", logo: "🚚" },
    { name: "DHL", logo: "📦" },
    { name: "FedEx", logo: "✈️" },
    { name: "DPD", logo: "🏃" },
    { name: "Express Bees", logo: "🐝" },
    { name: "Delhivery", logo: "🚛" }
  ];

  return (
    <main className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
            A Full Range Of Courier Solutions For Every Business Need
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-4xl mx-auto">
            Visakha International Couriers is a tireless team working smart to subdue your anxiety.
            We help reach your personal, professional &amp; private courier packages across the globe—real quick &amp; without you breaking into a sweat.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-20">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-5 md:p-8">
                <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-foreground text-center mb-4">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-center mb-6">
                  {service.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-gradient-primary rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full group-hover:bg-gradient-primary group-hover:text-white group-hover:border-transparent">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-muted/30 rounded-lg p-4 md:p-8 mb-12 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-8 md:mb-12">Why Choose Our Services?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Express delivery options with real-time tracking for urgent shipments.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Secure & Safe</h3>
              <p className="text-muted-foreground">
                Advanced security measures and insurance coverage for all shipments.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Global Reach</h3>
              <p className="text-muted-foreground">
                Worldwide delivery network covering all major international destinations.
              </p>
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6 md:mb-12">
            We Provide Multiple Network Services
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">International &amp; Domestic</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {partners.map((partner, index) => (
              <Card key={index} className="hover:shadow-elegant transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{partner.logo}</div>
                  <h3 className="font-semibold text-foreground">{partner.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Services;