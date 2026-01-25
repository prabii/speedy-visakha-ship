import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

const Pricing = () => {
  const [priceSheet, setPriceSheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterService, setFilterService] = useState<string>('');

  // Fallback pricing data
  const fallbackPricingData = [
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

  useEffect(() => {
    const loadPriceSheet = async () => {
      try {
        setLoading(true);
        const data = await api.priceSheets.getActive();
        setPriceSheet(data);
        setError(null);
      } catch (err: any) {
        console.log('No active price sheet found, using fallback data');
        setError(err.message);
        setPriceSheet(null);
      } finally {
        setLoading(false);
      }
    };

    loadPriceSheet();
  }, []);

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

        {/* Price Sheet Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading pricing information...</p>
          </div>
        ) : priceSheet && priceSheet.items && priceSheet.items.length > 0 ? (
          <Card className="mb-16">
            <CardHeader className="bg-gradient-primary text-white">
              <CardTitle className="text-2xl text-center">
                {priceSheet.sheetName || 'Current Pricing Rates'}
              </CardTitle>
              {priceSheet.description && (
                <p className="text-center opacity-90 mt-2">{priceSheet.description}</p>
              )}
            </CardHeader>
            <CardContent className="p-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Input
                    placeholder="Search country..."
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="h-10 text-base"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Search service type..."
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="h-10 text-base"
                  />
                </div>
              </div>

              {/* Price Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-base">Item Name</TableHead>
                      {priceSheet.items.some((i: any) => i.hsnCode) && (
                        <TableHead className="font-semibold text-base">HSN Code</TableHead>
                      )}
                      {priceSheet.items.some((i: any) => i.weight) && (
                        <TableHead className="font-semibold text-base">Weight</TableHead>
                      )}
                      {priceSheet.items.some((i: any) => i.country) && (
                        <TableHead className="font-semibold text-base">Country</TableHead>
                      )}
                      {priceSheet.items.some((i: any) => i.destination) && (
                        <TableHead className="font-semibold text-base">Destination</TableHead>
                      )}
                      {priceSheet.items.some((i: any) => i.serviceType) && (
                        <TableHead className="font-semibold text-base">Service Type</TableHead>
                      )}
                      <TableHead className="font-semibold text-base text-right">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceSheet.items
                      .filter((item: any) => {
                        const countryMatch = !filterCountry || 
                          (item.country && item.country.toLowerCase().includes(filterCountry.toLowerCase()));
                        const serviceMatch = !filterService || 
                          (item.serviceType && item.serviceType.toLowerCase().includes(filterService.toLowerCase()));
                        return countryMatch && serviceMatch;
                      })
                      .map((item: any, index: number) => {
                        // Clean item name - remove FEDEX and service type mentions
                        let cleanItemName = item.itemName || '';
                        if (cleanItemName) {
                          // Remove "FEDEX - " prefix and service type mentions
                          cleanItemName = cleanItemName.replace(/^FEDEX\s*-\s*/i, '');
                          cleanItemName = cleanItemName.replace(/\s*-\s*FEDEX\s*/i, '');
                          // Remove service type from item name if it's already in serviceType column
                          if (item.serviceType) {
                            cleanItemName = cleanItemName.replace(new RegExp(`\\s*-\\s*${item.serviceType}\\s*`, 'i'), '');
                          }
                        }
                        
                        return (
                          <TableRow key={item._id || index} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-base">{cleanItemName || '-'}</TableCell>
                            {priceSheet.items.some((i: any) => i.hsnCode) && (
                              <TableCell className="text-base">{item.hsnCode || '-'}</TableCell>
                            )}
                            {priceSheet.items.some((i: any) => i.weight) && (
                              <TableCell className="text-base">{item.weight || '-'}</TableCell>
                            )}
                            {priceSheet.items.some((i: any) => i.country) && (
                              <TableCell>
                                {item.country && (
                                  <Badge variant="outline" className="text-sm px-3 py-1">{item.country}</Badge>
                                )}
                              </TableCell>
                            )}
                            {priceSheet.items.some((i: any) => i.destination) && (
                              <TableCell className="text-base">{item.destination || '-'}</TableCell>
                            )}
                            {priceSheet.items.some((i: any) => i.serviceType) && (
                              <TableCell>
                                {item.serviceType && (
                                  <Badge variant="outline" className="text-sm px-3 py-1">{item.serviceType}</Badge>
                                )}
                              </TableCell>
                            )}
                            <TableCell className="text-right">
                              <span className="font-bold text-lg text-blue-600">
                                {item.currency || 'INR'} {item.rate?.toLocaleString('en-IN') || '0'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
              {priceSheet.items.filter((item: any) => {
                const countryMatch = !filterCountry || 
                  (item.country && item.country.toLowerCase().includes(filterCountry.toLowerCase()));
                const serviceMatch = !filterService || 
                  (item.serviceType && item.serviceType.toLowerCase().includes(filterService.toLowerCase()));
                return countryMatch && serviceMatch;
              }).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No items found matching your filters
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Fallback Pricing Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {fallbackPricingData.map((item, index) => (
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
        )}

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