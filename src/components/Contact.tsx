import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Map from "@/components/Map";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare 
} from "lucide-react";

export const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Get in Touch
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to ship? Contact us today for the best international courier services 
            from Visakhapatnam to anywhere in the world.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-semibold mb-8 text-foreground">
              Contact Information
            </h3>
            
            <div className="space-y-6">
              <Card className="hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Address</h4>
                      <p className="text-muted-foreground">
                        7-17-7/2, Opp. Redcherry Bakery<br />
                        Old Gajuwaka, Visakhapatnam - 530026<br />
                        Andhra Pradesh, India
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                      <p className="text-muted-foreground">+91 832 853 8901</p>
                      <p className="text-muted-foreground text-sm mt-1">Call us for immediate assistance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">WhatsApp</h4>
                      <p className="text-muted-foreground">+91 832 853 8901</p>
                      <p className="text-muted-foreground text-sm mt-1">Quick support on WhatsApp</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Business Hours</h4>
                      <p className="text-muted-foreground">
                        Monday - Saturday: 9:00 AM - 7:00 PM<br />
                        Sunday: 10:00 AM - 4:00 PM
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="shadow-elegant">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold mb-6 text-foreground">
                Send us a Message
              </h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <Input placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <Input placeholder="Your phone" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input placeholder="your.email@example.com" type="email" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Service Needed
                  </label>
                  <Input placeholder="Document, Parcel, Excess Baggage, etc." />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <Textarea 
                    placeholder="Tell us about your shipping requirements..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button variant="hero" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Find Us</h3>
            <p className="text-muted-foreground">
              Visit our office for in-person consultations and service
            </p>
          </div>
          <Map />
        </div>
      </div>
    </section>
  );
};