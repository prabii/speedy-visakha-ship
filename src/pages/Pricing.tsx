import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const FLAG: Record<string, string> = {
  USA: "🇺🇸",
  CANADA: "🇨🇦",
  UK: "🇬🇧",
  AUSTRALIA: "🇦🇺",
  UAE: "🇦🇪",
  DUBAI: "🇦🇪",
  SINGAPORE: "🇸🇬",
  GERMANY: "🇩🇪",
  FRANCE: "🇫🇷",
  ITALY: "🇮🇹",
  SPAIN: "🇪🇸",
  NETHERLANDS: "🇳🇱",
  JAPAN: "🇯🇵",
  CHINA: "🇨🇳",
  MALAYSIA: "🇲🇾",
  NEWZEALAND: "🇳🇿",
  "NEW ZEALAND": "🇳🇿",
  SWEDEN: "🇸🇪",
  NORWAY: "🇳🇴",
  DENMARK: "🇩🇰",
  SWITZERLAND: "🇨🇭",
  AUSTRIA: "🇦🇹",
  BELGIUM: "🇧🇪",
  PORTUGAL: "🇵🇹",
  IRELAND: "🇮🇪",
  QATAR: "🇶🇦",
  KUWAIT: "🇰🇼",
  BAHRAIN: "🇧🇭",
  OMAN: "🇴🇲",
  SAUDI: "🇸🇦",
  "SAUDI ARABIA": "🇸🇦",
  HONGKONG: "🇭🇰",
  "HONG KONG": "🇭🇰",
  THAILAND: "🇹🇭",
  SOUTHKOREA: "🇰🇷",
  "SOUTH KOREA": "🇰🇷",
};

const Pricing = () => {
  const { isVendor, user } = useAuth();
  const [priceSheet, setPriceSheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterService, setFilterService] = useState<string>('');
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicSheets, setPublicSheets] = useState<any[]>([]);
  const [pricingImages, setPricingImages] = useState<any[]>([]);

  const vendorMode = isVendor();

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
        const vendorId = vendorMode && user?._id ? user._id : undefined;
        const data = await api.priceSheets.getActive(vendorId);
        if (data && data.items && data.items.length > 0) {
          setPriceSheet(data);
        } else {
          const allSheets = await api.priceSheets.getAll({ isActive: true, vendorId });
          if (allSheets && allSheets.length > 0) {
            setPriceSheet(allSheets[0]);
          } else {
            setPriceSheet(null);
            setError('No pricing data available. Please contact administrator.');
          }
        }
      } catch (err: any) {
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
        } catch {
          setPriceSheet(null);
          setError('No pricing data available. Please contact administrator.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPriceSheet();
  }, [vendorMode]);

  // Load public customer rates (array of sheets)
  useEffect(() => {
    if (vendorMode) return;
    setPublicLoading(true);
    api.priceSheets.getPublic()
      .then((data: any) => {
        const arr = Array.isArray(data) ? data : data ? [data] : [];
        setPublicSheets(arr.filter((s: any) => s.items?.length > 0));
      })
      .catch(() => {})
      .finally(() => setPublicLoading(false));
  }, [vendorMode]);

  // Load pricing images uploaded from admin
  useEffect(() => {
    if (vendorMode) return;
    api.gallery.getAll({ category: 'pricing', isActive: true })
      .then((data: any) => {
        const arr = Array.isArray(data) ? data : data?.items ?? [];
        setPricingImages(arr);
      })
      .catch(() => {});
  }, [vendorMode]);

  return (
    <main className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
            Competitive Pricing for Global Shipping
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Transparent and affordable rates for all your international courier needs.
            No hidden charges, just reliable service at great prices.
          </p>
        </div>

        {/* Vendors: detailed price table */}
        {vendorMode ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Input
                    placeholder="Search country..."
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="h-10 text-base"
                  />
                  <Input
                    placeholder="Search service type..."
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="h-10 text-base"
                  />
                </div>
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
          /* Public: pricing images carousel + price sheet cards */
          <div className="mb-16">
            {pricingImages.length > 0 && (
              <div className="mb-10">
                <Carousel
                  opts={{ align: "start", loop: pricingImages.length > 1 }}
                  className="w-full max-w-5xl mx-auto"
                >
                  <CarouselContent className="-ml-4">
                    {pricingImages.map((img: any) => (
                      <CarouselItem key={img._id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <div className="rounded-xl overflow-hidden shadow-lg border bg-white">
                          <img
                            src={img.url}
                            alt={img.title || 'Pricing'}
                            className="w-full h-56 object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          {img.title && (
                            <div className="px-4 py-2 text-sm font-medium text-gray-700 text-center">
                              {img.title}
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {pricingImages.length > 1 && (
                    <>
                      <CarouselPrevious className="-left-4 md:-left-6 shadow-md" />
                      <CarouselNext className="-right-4 md:-right-6 shadow-md" />
                    </>
                  )}
                </Carousel>
              </div>
            )}
            {publicLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading pricing...</p>
              </div>
            ) : publicSheets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Pricing information coming soon.</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">All rates in INR (₹) &nbsp;•&nbsp; GST applicable on select weights</p>
                </div>
                <Carousel
                  opts={{ align: "start", loop: publicSheets.length > 1 }}
                  className="w-full max-w-5xl mx-auto"
                >
                  <CarouselContent className="-ml-4">
                    {publicSheets.map((sheet: any) => {
                      const sheetCountries = [...new Set(sheet.items.map((i: any) => i.country).filter(Boolean))] as string[];
                      const primaryCountry = sheetCountries[0] || "";
                      const flag = FLAG[primaryCountry?.toUpperCase()] || "🌍";
                      return (
                        <CarouselItem key={sheet._id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                          <Card className="h-full border-0 shadow-lg overflow-hidden flex flex-col">
                            <CardHeader className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-4 px-5">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl leading-none">{flag}</span>
                                <div className="min-w-0">
                                  <CardTitle className="text-base font-bold text-white leading-tight truncate">
                                    {sheet.sheetName}
                                  </CardTitle>
                                  {sheetCountries.length > 0 && (
                                    <p className="text-blue-200 text-xs mt-0.5 truncate">
                                      {sheetCountries.join(" · ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1.5 mt-2 flex-wrap">
                                <Badge className="bg-white/20 text-white border-0 text-xs">
                                  {sheet.items.length} rates
                                </Badge>
                                {sheet.isDefault && (
                                  <Badge className="bg-green-400/80 text-white border-0 text-xs">⭐ Default</Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-gray-50 border-b">
                                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Weight</th>
                                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Rate (₹)</th>
                                    <th className="text-center px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">GST</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sheet.items.map((item: any, idx: number) => {
                                    const gstInclusive = item.gstInclusive || item.additionalInfo?.gstInclusive;
                                    return (
                                      <tr key={item._id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                                        <td className="px-4 py-2.5 font-medium text-gray-800 text-sm">
                                          {item.weight}
                                          {item.destination && (
                                            <span className="text-xs text-gray-400 ml-1">({item.destination})</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                          <span className="font-bold text-blue-700">
                                            ₹{item.rate?.toLocaleString("en-IN")}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                          {gstInclusive
                                            ? <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Incl.</span>
                                            : <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Incl. GST</span>
                                          }
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </CardContent>
                            <div className="px-4 py-2.5 bg-gray-50 border-t text-xs text-center text-gray-400">
                              Rates in INR · GST as per govt. norms on select weights
                            </div>
                          </Card>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  {publicSheets.length > 1 && (
                    <>
                      <CarouselPrevious className="-left-4 md:-left-6 shadow-md" />
                      <CarouselNext className="-right-4 md:-right-6 shadow-md" />
                    </>
                  )}
                </Carousel>
                {publicSheets.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-5">
                    {publicSheets.map((_: any, i: number) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                    ))}
                  </div>
                )}
              </>
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
