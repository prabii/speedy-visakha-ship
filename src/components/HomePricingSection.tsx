import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const HomePricingSection = () => {
  const [priceSheet, setPriceSheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.priceSheets.getPublic()
      .then((data: any) => { if (data?.items?.length) setPriceSheet(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !priceSheet) return null;

  const items: any[] = priceSheet.items || [];
  const countries = [...new Set(items.map((i: any) => i.country).filter(Boolean))];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Courier Rates <span className="text-blue-600">(Per Kg)</span>
          </h2>
          <p className="text-muted-foreground">
            Rates in INR. GST applicable on select weights.
          </p>
        </div>

        <Card className="shadow-xl max-w-2xl mx-auto overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-4 text-center">
            <CardTitle className="text-base md:text-lg tracking-wide">International Shipping Rates</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue={countries[0]} className="w-full">
              <TabsList className="w-full rounded-none border-b flex flex-wrap h-auto gap-0">
                {countries.map((c) => (
                  <TabsTrigger key={c} value={c} className="text-xs md:text-sm py-2 md:py-3 px-2 md:px-4 flex-1 min-w-fit">
                    {FLAG[c] || "🌍"} {c}
                  </TabsTrigger>
                ))}
              </TabsList>
              {countries.map((country) => {
                const rows = items.filter((i: any) => i.country === country);
                return (
                  <TabsContent key={country} value={country} className="m-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                          <th className="text-left px-4 md:px-6 py-3 font-semibold text-gray-700">Weight (Kg)</th>
                          <th className="text-right px-4 md:px-6 py-3 font-semibold text-gray-700">Rate (INR ₹)</th>
                          <th className="text-center px-2 md:px-4 py-3 font-semibold text-gray-700">GST</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((item: any, idx: number) => {
                          const gstInclusive = item.additionalInfo?.get?.('gstInclusive') || item.gstInclusive;
                          return (
                            <tr key={item._id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="px-4 md:px-6 py-3 font-medium text-gray-800">
                                {item.weight}
                                {item.destination && (
                                  <span className="text-xs text-gray-400 ml-1">({item.destination})</span>
                                )}
                              </td>
                              <td className="px-4 md:px-6 py-3 text-right">
                                <span className="font-bold text-blue-700 text-base">
                                  ₹{item.rate?.toLocaleString("en-IN")}
                                </span>
                              </td>
                              <td className="px-2 md:px-4 py-3 text-center">
                                {gstInclusive
                                  ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Incl.</span>
                                  : <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">+GST</span>
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <p className="text-xs text-center text-gray-500 py-3 border-t bg-gray-50">
                      * All rates in INR (₹). GST applicable on select weights as per govt. norms.
                    </p>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HomePricingSection;
