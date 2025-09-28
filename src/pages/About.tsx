import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Globe, Award } from "lucide-react";

const About = () => {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-6">
            About Visakha International Couriers
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            We, VISAKHA INTERNATIONAL COURIERS are a leading logistics company that provides 
            comprehensive and efficient services to businesses and individuals alike.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-16">
          <div>
            <h2 className="text-3xl font-semibold text-foreground mb-6">Our Story</h2>
            <p className="text-muted-foreground mb-6">
              With a team of experienced professionals and advanced technology, we are able to handle 
              all types of logistic needs, from small packages to large shipments and everything in between.
            </p>
            <p className="text-muted-foreground mb-6">
              Our mission is to provide our clients with the highest level of service and satisfaction, 
              while maintaining the highest standards of professionalism and integrity.
            </p>
            <p className="text-muted-foreground">
              Whether it is domestic or international shipping, we have the expertise and resources to 
              get the goods where they need to go quickly and efficiently. We are a reliable and 
              trustworthy logistics service provider.
            </p>
          </div>
          
          <div className="space-y-6">
            <Card className="hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Global Network</h3>
                    <p className="text-muted-foreground text-sm">
                      Worldwide shipping coverage with trusted international partners
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Expert Team</h3>
                    <p className="text-muted-foreground text-sm">
                      Experienced professionals dedicated to handling your logistics needs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Quality Service</h3>
                    <p className="text-muted-foreground text-sm">
                      Highest standards of professionalism and customer satisfaction
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-muted/30 rounded-lg p-8">
          <h2 className="text-3xl font-semibold text-foreground text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Reliability</h3>
              <p className="text-muted-foreground">
                We ensure your packages reach their destination safely and on time, every time.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Customer Focus</h3>
              <p className="text-muted-foreground">
                Our customers are at the heart of everything we do. Your success is our priority.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Excellence</h3>
              <p className="text-muted-foreground">
                We continuously strive for excellence in all aspects of our service delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default About;