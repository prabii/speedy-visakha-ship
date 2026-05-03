import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import api from "@/lib/api";

const FLAG: Record<string, string> = {
  USA: "🇺🇸", "UNITED STATES": "🇺🇸",
  CANADA: "🇨🇦",
  UK: "🇬🇧", "UNITED KINGDOM": "🇬🇧",
  AUSTRALIA: "🇦🇺",
  UAE: "🇦🇪", DUBAI: "🇦🇪",
  SINGAPORE: "🇸🇬",
  GERMANY: "🇩🇪",
  FRANCE: "🇫🇷",
  ITALY: "🇮🇹",
  SPAIN: "🇪🇸",
  NETHERLANDS: "🇳🇱",
  JAPAN: "🇯🇵",
  CHINA: "🇨🇳",
  MALAYSIA: "🇲🇾",
  "NEW ZEALAND": "🇳🇿", NEWZEALAND: "🇳🇿",
  SWEDEN: "🇸🇪",
  NORWAY: "🇳🇴",
  DENMARK: "🇩🇰",
  SWITZERLAND: "🇨🇭",
  QATAR: "🇶🇦",
  KUWAIT: "🇰🇼",
  BAHRAIN: "🇧🇭",
  OMAN: "🇴🇲",
  SAUDI: "🇸🇦", "SAUDI ARABIA": "🇸🇦",
  "HONG KONG": "🇭🇰", HONGKONG: "🇭🇰",
  THAILAND: "🇹🇭",
  "SOUTH KOREA": "🇰🇷", SOUTHKOREA: "🇰🇷",
};

const getFlag = (country: string) =>
  FLAG[country?.toUpperCase()] || "🌍";

const HomePricingSection = () => {
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.priceSheets.getPublic()
      .then((data: any) => {
        // backend now returns array
        const arr = Array.isArray(data) ? data : data ? [data] : [];
        setSheets(arr.filter((s: any) => s.items?.length > 0));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || sheets.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            International Shipping Rates
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-4">
            All rates in INR (₹) &nbsp;•&nbsp; GST applicable on select weights
          </p>
          <Link to="/rate-calculator">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md gap-2 px-6 h-11">
              <Calculator className="h-4 w-4" />
              Rate Calculator
            </Button>
          </Link>
        </div>

        <Carousel
          opts={{ align: "start", loop: sheets.length > 1 }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {sheets.map((sheet: any) => {
              const countries = [...new Set(sheet.items.map((i: any) => i.country).filter(Boolean))] as string[];
              const primaryCountry = countries[0] || "";
              const flag = getFlag(primaryCountry);

              return (
                <CarouselItem key={sheet._id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full border-0 shadow-lg overflow-hidden flex flex-col">
                    {/* Card Header */}
                    <CardHeader className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-4 px-5">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl leading-none">{flag}</span>
                        <div className="min-w-0">
                          <CardTitle className="text-base font-bold text-white leading-tight truncate">
                            {sheet.sheetName}
                          </CardTitle>
                          {countries.length > 0 && (
                            <p className="text-blue-200 text-xs mt-0.5 truncate">
                              {countries.join(" · ")}
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

                    {/* Rate Table */}
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

                    {/* Footer */}
                    <div className="px-4 py-2.5 bg-gray-50 border-t text-xs text-center text-gray-400">
                      Rates in INR · GST as per govt. norms on select weights
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {sheets.length > 1 && (
            <>
              <CarouselPrevious className="-left-4 md:-left-6 shadow-md" />
              <CarouselNext className="-right-4 md:-right-6 shadow-md" />
            </>
          )}
        </Carousel>

        {/* Dot indicators */}
        {sheets.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-5">
            {sheets.map((_: any, i: number) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-300" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomePricingSection;
