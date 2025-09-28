import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import pricingChart from "@/assets/pricing-chart.png";

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Competitive Pricing for Global Shipping
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transparent and affordable rates for all your international courier needs. 
            No hidden charges, just reliable service at great prices.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="shadow-elegant overflow-hidden">
            <CardHeader className="bg-gradient-primary text-white text-center">
              <CardTitle className="text-2xl">International Shipping Rates</CardTitle>
              <p className="opacity-90">All prices in Indian Rupees (₹)</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <img 
                  src={pricingChart} 
                  alt="Visakha International Couriers Pricing Chart"
                  className="w-full h-auto"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
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

          <div className="text-center mt-12">
            <Button variant="hero" size="lg" className="px-8">
              Get Custom Quote
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};