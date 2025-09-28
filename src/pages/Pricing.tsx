import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const pricingData = [
    {
      destination: "USA/Canada",
      documents: "₹800",
      parcels: "₹1200/kg",
      features: ["3-5 days delivery", "Free tracking", "Door pickup"]
    },
    {
      destination: "Europe",
      documents: "₹900",
      parcels: "₹1400/kg", 
      features: ["4-6 days delivery", "Free tracking", "Insurance included"]
    },
    {
      destination: "Australia",
      documents: "₹950",
      parcels: "₹1500/kg",
      features: ["5-7 days delivery", "Express option", "Customs clearance"]
    },
    {
      destination: "Middle East",
      documents: "₹700",
      parcels: "₹1000/kg",
      features: ["2-4 days delivery", "Same day pickup", "Real-time tracking"]
    },
    {
      destination: "Asia Pacific",
      documents: "₹600",
      parcels: "₹900/kg",
      features: ["3-5 days delivery", "Economy rates", "Bulk discounts"]
    },
    {
      destination: "UK",
      documents: "₹1000",
      parcels: "₹1600/kg",
      features: ["3-5 days delivery", "Premium service", "SMS updates"]
    }
  ];

  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-6">
            Competitive Pricing for Global Shipping
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transparent and affordable rates for all your international courier needs. 
            No hidden charges, just reliable service at great prices.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {pricingData.map((item, index) => (
            <Card key={index} className="hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="bg-gradient-primary text-white text-center">
                <CardTitle className="text-xl">{item.destination}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Documents:</span>
                    <span className="text-lg font-bold text-primary">{item.documents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Parcels:</span>
                    <span className="text-lg font-bold text-primary">{item.parcels}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  {item.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-gradient-secondary rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full hover:bg-gradient-secondary hover:text-white hover:border-transparent">
                  Get Quote
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">$</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Best Rates</h3>
              <p className="text-muted-foreground text-sm">
                Competitive pricing across all destinations
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">%</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Hidden Fees</h3>
              <p className="text-muted-foreground text-sm">
                Transparent pricing with no surprise charges
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">✓</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Insurance Included</h3>
              <p className="text-muted-foreground text-sm">
                Free basic insurance on all shipments
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg" className="px-8">
            Get Custom Quote
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Pricing;