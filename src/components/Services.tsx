import { Card, CardContent } from "@/components/ui/card";
import { 
  Package, 
  FileText, 
  ShoppingBag, 
  Plane, 
  Shield, 
  Clock,
  MapPin,
  DollarSign 
} from "lucide-react";

const services = [
  {
    icon: Package,
    title: "Express Courier",
    description: "Fast and efficient delivery for urgent packages and documents worldwide.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop",
    details: "Our express courier service ensures your urgent packages reach their destination in the shortest possible time. With priority handling and dedicated tracking, we guarantee fast and secure delivery worldwide."
  },
  {
    icon: FileText,
    title: "Document Services", 
    description: "Secure handling of important documents, certificates, and legal papers.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop",
    details: "Specialized document courier services with enhanced security protocols. Perfect for legal documents, certificates, contracts, and confidential papers. Includes tamper-proof packaging and signature confirmation."
  },
  {
    icon: ShoppingBag,
    title: "Excess Baggage",
    description: "Cost-effective solution for shipping excess luggage and personal items.",
    image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&h=600&fit=crop",
    details: "Travel with peace of mind. Ship your excess baggage separately at competitive rates. We handle pickup from your location and deliver to your destination, making travel hassle-free."
  },
  {
    icon: Plane,
    title: "International Shipping",
    description: "Reliable shipping services to USA, Canada, Australia, Europe and more.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop",
    details: "Global shipping network covering 200+ countries. Expert handling of customs clearance, documentation, and international regulations. Trusted by businesses and individuals worldwide."
  },
  {
    icon: Shield,
    title: "Secure Handling",
    description: "Advanced security measures and insurance coverage for valuable items.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    details: "Your valuable shipments are protected with comprehensive insurance coverage and advanced security measures. We use tamper-evident packaging and provide full tracking throughout the journey."
  },
  {
    icon: Clock,
    title: "Time-Definite Delivery",
    description: "Guaranteed delivery times with real-time tracking and updates.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    details: "Get guaranteed delivery times with our time-definite service. Real-time tracking updates keep you informed every step of the way. We commit to on-time delivery or your money back."
  },
  {
    icon: MapPin,
    title: "Door-to-Door Service",
    description: "Complete pickup and delivery service right to your doorstep.",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
    details: "Convenient door-to-door service means we pick up from your location and deliver directly to the recipient's address. No need to visit shipping centers - we come to you!"
  },
  {
    icon: DollarSign,
    title: "Competitive Rates",
    description: "Best prices in the market without compromising on quality or reliability.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop",
    details: "Get the best value for your money with our competitive pricing. We offer transparent rates with no hidden charges. Quality service at affordable prices - that's our promise."
  }
];

export const Services = () => {
  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Your Reliable Courier Services Provider
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We understand the frustrations in the industry and prioritize customer satisfaction 
            with fast, secure, and personalized services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="relative w-full h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.image-fallback');
                    if (fallback) {
                      (fallback as HTMLElement).classList.remove('hidden');
                    }
                  }}
                />
                <div className="hidden image-fallback absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <service.icon className="text-white" size={64} />
                </div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                  <service.icon className="text-blue-600" size={24} />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  {service.description}
                </p>
                <p className="text-foreground text-sm leading-relaxed">
                  {service.details}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-primary font-semibold">
            <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">01</span>
            <span>Fast and efficient delivery for urgent packages and documents.</span>
          </div>
        </div>
      </div>
    </section>
  );
};