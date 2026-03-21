import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

const HomePricingSection = () => {
  const [priceSheet, setPriceSheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.priceSheets.getActive();
        if (data && data.items && data.items.length > 0) {
          setPriceSheet(data);
        }
      } catch {
        // No active price sheet — silently hide the section
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !priceSheet) return null;

  const items: any[] = priceSheet.items || [];
  const hasWeight = items.some((i) => i.weight);
  const hasCountry = items.some((i) => i.country);
  const hasDestination = items.some((i) => i.destination);
  const hasServiceType = items.some((i) => i.serviceType);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Courier Rates
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transparent pricing for all your international courier needs.
          </p>
          {priceSheet.sheetName && (
            <p className="text-sm text-blue-600 font-medium mt-2">
              {priceSheet.sheetName}
            </p>
          )}
        </div>

        <Card className="shadow-lg overflow-hidden max-w-5xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4">
            <CardTitle className="text-center text-lg">Price List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      Item / Description
                    </th>
                    {hasWeight && (
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Weight
                      </th>
                    )}
                    {hasCountry && (
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Country
                      </th>
                    )}
                    {hasDestination && (
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Destination
                      </th>
                    )}
                    {hasServiceType && (
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Service
                      </th>
                    )}
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">
                      Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr
                      key={item._id || idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item.itemName || "-"}
                      </td>
                      {hasWeight && (
                        <td className="px-4 py-3 text-gray-600">
                          {item.weight || "-"}
                        </td>
                      )}
                      {hasCountry && (
                        <td className="px-4 py-3">
                          {item.country ? (
                            <Badge variant="outline" className="text-xs">
                              {item.country}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </td>
                      )}
                      {hasDestination && (
                        <td className="px-4 py-3 text-gray-600">
                          {item.destination || "-"}
                        </td>
                      )}
                      {hasServiceType && (
                        <td className="px-4 py-3">
                          {item.serviceType ? (
                            <Badge variant="outline" className="text-xs">
                              {item.serviceType}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        {item.currency || "INR"}{" "}
                        {item.rate?.toLocaleString("en-IN") || "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          * Rates are subject to change. Contact us for custom quotes.
        </p>
      </div>
    </section>
  );
};

export default HomePricingSection;
