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
    description: "Fast and efficient delivery for urgent packages and documents worldwide."
  },
  {
    icon: FileText,
    title: "Document Services", 
    description: "Secure handling of important documents, certificates, and legal papers."
  },
  {
    icon: ShoppingBag,
    title: "Excess Baggage",
    description: "Cost-effective solution for shipping excess luggage and personal items."
  },
  {
    icon: Plane,
    title: "International Shipping",
    description: "Reliable shipping services to USA, Canada, Australia, Europe and more."
  },
  {
    icon: Shield,
    title: "Secure Handling",
    description: "Advanced security measures and insurance coverage for valuable items."
  },
  {
    icon: Clock,
    title: "Time-Definite Delivery",
    description: "Guaranteed delivery times with real-time tracking and updates."
  },
  {
    icon: MapPin,
    title: "Door-to-Door Service",
    description: "Complete pickup and delivery service right to your doorstep."
  },
  {
    icon: DollarSign,
    title: "Competitive Rates",
    description: "Best prices in the market without compromising on quality or reliability."
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
            <Card key={index} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                  <service.icon className="text-white" size={32} />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
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