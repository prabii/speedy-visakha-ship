import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

// Gallery item type reused for public pricing images
interface PricingGalleryItem {
  _id: string;
  type: "image" | "video" | "youtube" | "imageUrl";
  url: string;
  title?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
}

const Pricing = () => {
  const { isVendor, user } = useAuth();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [priceSheet, setPriceSheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterService, setFilterService] = useState<string>('');
  const [publicImages, setPublicImages] = useState<PricingGalleryItem[]>([]);
  const [publicLoading, setPublicLoading] = useState<boolean>(false);

  const vendorMode = isVendor();
  
  // Debug logging
  useEffect(() => {
    console.log('Pricing page - User:', user);
    console.log('Pricing page - Is Vendor:', vendorMode);
  }, [user, vendorMode]);

  // Load price sheet for vendors
  useEffect(() => {
    if (!vendorMode) {
      setLoading(false);
      return;
    }

    const loadPriceSheet = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get vendor ID for filtering - only pass if user is a vendor
        const vendorId = vendorMode && user?._id ? user._id : undefined;
        
        console.log('Loading price sheet for vendor:', vendorId, 'User:', user);
        
        // Try to get active price sheet (filtered by vendor if vendorId exists)
        const data = await api.priceSheets.getActive(vendorId);
        if (data && data.items && data.items.length > 0) {
          setPriceSheet(data);
        } else {
          // If no active, try to get any price sheet (filtered by vendor)
          const allSheets = await api.priceSheets.getAll({ isActive: true, vendorId });
          if (allSheets && allSheets.length > 0) {
            setPriceSheet(allSheets[0]);
          } else {
            setPriceSheet(null);
            setError('No pricing data available. Please contact administrator.');
          }
        }
      } catch (err: any) {
        console.log('No active price sheet found:', err);
        // Try to get any price sheet as fallback
        try {
          const vendorId = vendorMode && user?._id ? user._id : undefined;
          const allSheets = await api.priceSheets.getAll({ isActive: true, vendorId });
          if (allSheets && allSheets.length > 0) {
            setPriceSheet(allSheets[0]);
            setError(null);
          } else {
            setPriceSheet(null);
            setError('No pricing data available. Please contact administrator.');
          }
        } catch (fallbackErr: any) {
          setPriceSheet(null);
          setError('No pricing data available. Please contact administrator.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPriceSheet();
  }, [vendorMode]);

  // Load public pricing images from Gallery for client-side pricing section
  useEffect(() => {
    if (vendorMode) {
      return;
    }

    const loadPublicImages = async () => {
      try {
        setPublicLoading(true);
        // Get only pricing category images from gallery API
        const data = await api.gallery.getAll();
        const items = (data || []) as PricingGalleryItem[];
        const images = items
          .filter((item) => 
            (item.type === "image" || item.type === "imageUrl") && 
            item.isActive !== false &&
            (item as any).category === 'pricing' // Only pricing category images
          )
          .sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          });
        setPublicImages(images);
      } catch (error) {
        console.error("Failed to load public pricing images from gallery:", error);
        setPublicImages([]);
      } finally {
        setPublicLoading(false);
      }
    };

    loadPublicImages();
  }, [vendorMode]);

  // Auto-play carousel for public users
  useEffect(() => {
    if (!carouselApi || vendorMode) {
      return;
    }

    const interval = setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else {
        carouselApi.scrollTo(0); // Reset to first slide
      }
    }, 10000); // Change slide every 10 seconds (slower)

    return () => clearInterval(interval);
  }, [carouselApi, vendorMode]);

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

        {/* Show pricing table for vendors, carousel for public */}
        {vendorMode ? (
          /* Price Sheet Table for Vendors */
          loading ? (
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
                            cleanItemName = cleanItemName.replace(/^FEDEX\s*-\s*/i, '');
                            cleanItemName = cleanItemName.replace(/\s*-\s*FEDEX\s*/i, '');
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
          ) : error ? (
            <Card className="mb-16">
              <CardContent className="p-12 text-center">
                <p className="text-lg text-muted-foreground mb-4">{error}</p>
                <p className="text-sm text-muted-foreground">
                  Please contact the administrator to set up pricing information.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pricing data available</p>
            </div>
          )
        ) : (
          /* Pricing Chart Images Carousel for Public */
          <div className="mb-16">
            {publicLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading pricing images...</p>
              </div>
            ) : publicImages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No pricing images configured yet. Please add images in the Gallery (type: image) to show them here.
                </p>
              </div>
            ) : (
              <Carousel 
                className="w-full max-w-4xl mx-auto" 
                setApi={setCarouselApi}
                opts={{ 
                  align: "start", 
                  loop: true
                }}
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {publicImages.map((item) => (
                    <CarouselItem key={item._id} className="pl-2 md:pl-4">
                      <Card className="overflow-hidden shadow-lg">
                        <CardContent className="p-0">
                          <img 
                            src={item.url}
                            alt={item.title || "Pricing chart"}
                            className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                          />
                          {(item.title || item.description) && (
                            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                              {item.title && (
                                <h3 className="text-xl font-bold mb-2 text-foreground">
                                  {item.title}
                                </h3>
                              )}
                              {item.description && (
                                <p className="text-muted-foreground">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 md:-left-12 bg-white/90 hover:bg-white shadow-lg" />
                <CarouselNext className="right-2 md:-right-12 bg-white/90 hover:bg-white shadow-lg" />
              </Carousel>
            )}
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