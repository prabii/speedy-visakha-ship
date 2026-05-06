import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, Package, MapPin, ArrowRight, CheckCircle2, Info } from "lucide-react";
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
  "NEW ZEALAND": "🇳🇿",
  SWEDEN: "🇸🇪",
  NORWAY: "🇳🇴",
  DENMARK: "🇩🇰",
  SWITZERLAND: "🇨🇭",
  QATAR: "🇶🇦",
  KUWAIT: "🇰🇼",
  BAHRAIN: "🇧🇭",
  OMAN: "🇴🇲",
  SAUDI: "🇸🇦", "SAUDI ARABIA": "🇸🇦",
  "HONG KONG": "🇭🇰",
  THAILAND: "🇹🇭",
  "SOUTH KOREA": "🇰🇷",
};

const getFlag = (c: string) => FLAG[c?.toUpperCase()] || "🌍";

// Parse weight slab strings → lower bound in kg for sorting & matching
// e.g. "6 TO 10 Kg" → 6, "21 ABOVE" → 21, "0.500" → 0.5, "500g" → 0.5
const parseWeightKg = (w: string): number => {
  if (!w) return 0;
  const lower = w.toLowerCase().replace(/\s/g, "");
  // Range like "6to10kg" or "11to20kg" → use the start (lower bound)
  const rangeMatch = lower.match(/^(\d+\.?\d*)to/);
  if (rangeMatch) return parseFloat(rangeMatch[1]) || 0;
  // Grams only (e.g. "500g" but not "kg")
  if (lower.includes("g") && !lower.includes("kg")) {
    return (parseFloat(lower.replace(/[^\d.]/g, "")) || 0) / 1000;
  }
  // Default: extract first number ("0.500" → 0.5, "21above" → 21, "30kgabove" → 30)
  return parseFloat(lower.replace(/[^\d.]/g, "")) || 0;
};

const RateCalculator = () => {
  const navigate = useNavigate();
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api.priceSheets
      .getPublic()
      .then((data: any) => {
        const arr = Array.isArray(data) ? data : data ? [data] : [];
        const active = arr.filter((s: any) => s.items?.length > 0);
        setSheets(active);
        const seen = new Set<string>();
        const list: string[] = [];
        active.forEach((sheet: any) => {
          sheet.items.forEach((item: any) => {
            if (item.country && !seen.has(item.country.toUpperCase())) {
              seen.add(item.country.toUpperCase());
              list.push(item.country);
            }
          });
        });
        setCountries(list.sort());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // All items for selected country
  const countryItems = (): any[] => {
    const items: any[] = [];
    sheets.forEach((sheet) => {
      sheet.items
        .filter((i: any) => i.country?.toUpperCase() === selectedCountry.toUpperCase())
        .forEach((i: any) => items.push({ ...i, sheetName: sheet.sheetName }));
    });
    return items;
  };

  const handleCalculate = () => {
    const inputKg = parseFloat(weight);
    if (!selectedCountry || !inputKg || inputKg <= 0) return;

    const items = countryItems();
    if (items.length === 0) {
      setResult({ notFound: true });
      return;
    }

    // Sort by lower bound ascending
    const sorted = items
      .map((i) => ({ ...i, _kg: parseWeightKg(i.weight) }))
      .filter((i) => i._kg >= 0)
      .sort((a, b) => a._kg - b._kg);

    if (sorted.length === 0) {
      setResult({ notFound: true });
      return;
    }

    // Match: last slab whose lower bound ≤ inputKg (highest applicable slab)
    const eligible = sorted.filter((i) => i._kg <= inputKg);
    let matched = eligible.length > 0 ? eligible[eligible.length - 1] : sorted[0];

    // All published rates are GST-inclusive — total = base rate only
    const base = matched.rate as number;
    const gstAmt = 0;
    const total = base;

    setResult({
      matched,
      inputKg,
      base,
      gstAmt,
      total,
    });
  };

  const items = selectedCountry ? countryItems() : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">

          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
              <Calculator className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
              Shipping Rate Calculator
            </h1>
            <p className="text-gray-600">Get instant shipping rates for your packages worldwide</p>
            <p className="text-sm text-gray-400 mt-1">All rates are in Indian Rupees (₹)</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Left: Input Form ── */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Package Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">

                  {/* Origin — fixed */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">From (Origin)</Label>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      India 🇮🇳
                    </div>
                  </div>

                  {/* Destination country */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">To (Destination) *</Label>
                    {loading ? (
                      <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                    ) : countries.length === 0 ? (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        No published rates available yet.
                      </p>
                    ) : (
                      <Select
                        value={selectedCountry}
                        onValueChange={(v) => {
                          setSelectedCountry(v);
                          setResult(null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c} value={c}>
                              {getFlag(c)} {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Weight */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Package Weight (kg) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 0.5, 1, 2.5"
                      value={weight}
                      min="0.1"
                      step="0.1"
                      onChange={(e) => {
                        setWeight(e.target.value);
                        setResult(null);
                      }}
                    />
                    <p className="text-xs text-gray-400">
                      Rate is applied on the next published weight slab
                    </p>
                  </div>

                  <Button
                    onClick={handleCalculate}
                    disabled={!selectedCountry || !weight || loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-11"
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Rate
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* ── Right: Results + Rate Table ── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Result card */}
              {result && !result.notFound && (
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4 text-white">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-bold text-lg">
                        Rate for {getFlag(selectedCountry)} {selectedCountry}
                      </span>
                    </div>
                    <p className="text-green-100 text-xs mt-0.5">
                      Weight slab: {result.matched.weight}
                      {result.matched.sheetName ? ` · ${result.matched.sheetName}` : ""}
                      {result.matched.serviceType ? ` · ${result.matched.serviceType}` : ""}
                    </p>
                  </div>
                  <CardContent className="p-5">
                    <div className="space-y-0">
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-sm text-gray-600">Rate (GST Inclusive)</span>
                        <span className="font-semibold text-gray-800">
                          ₹{result.base.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5">
                          GST (18%)
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs px-1.5 py-0 h-4">
                            Included
                          </Badge>
                        </span>
                        <span className="text-sm text-green-600 font-medium">
                          Included in rate
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 mt-1 bg-blue-50 px-4 rounded-xl">
                        <span className="font-bold text-blue-800 text-base">Total Payable</span>
                        <span className="font-extrabold text-blue-700 text-2xl">
                          ₹{result.total.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-green-600 text-center mt-3 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      GST inclusive — no additional tax charges on this weight
                    </p>

                    <Button
                      onClick={() => navigate("/book-shipment")}
                      className="w-full mt-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-11 text-base font-semibold"
                    >
                      Book a Shipment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {result?.notFound && (
                <Card className="border-amber-200 bg-amber-50 shadow-sm">
                  <CardContent className="p-5 text-center">
                    <p className="text-amber-700 font-medium">No rates found for {selectedCountry}</p>
                    <p className="text-amber-600 text-sm mt-1">
                      Please contact us for a custom quote.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Rate table for selected country */}
              {selectedCountry && items.length > 0 && (
                <Card className="border-0 shadow-md overflow-hidden">
                  <CardHeader className="py-3 px-4 bg-gray-50 border-b">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      {getFlag(selectedCountry)} Published Rates — {selectedCountry}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                            Weight
                          </th>
                          <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                            Rate (₹)
                          </th>
                          <th className="text-center px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                            GST
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item: any, idx: number) => {
                          const isSelected =
                            result &&
                            !result.notFound &&
                            item.weight === result.matched.weight;
                          return (
                            <tr
                              key={idx}
                              className={`transition-colors ${
                                isSelected
                                  ? "bg-blue-50 ring-2 ring-inset ring-blue-400"
                                  : idx % 2 === 0
                                  ? "bg-white"
                                  : "bg-gray-50/60"
                              }`}
                            >
                              <td className="px-4 py-2.5 font-medium text-gray-800">
                                {item.weight}
                                {isSelected && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                                    ← selected
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-right font-bold text-blue-700">
                                ₹{item.rate?.toLocaleString("en-IN")}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                {item.rate ? (
                                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                    Incl. GST
                                  </span>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <p className="text-xs text-center text-gray-400 py-2.5 border-t bg-gray-50">
                      All rates in INR (₹) · GST is included in all published rates
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Empty state */}
              {!selectedCountry && !loading && countries.length > 0 && (
                <Card className="border-0 shadow-sm bg-white/60">
                  <CardContent className="p-8 text-center text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                    <p className="font-medium text-gray-500">Select a destination country</p>
                    <p className="text-sm mt-1">
                      Choose a country to see available weight slabs and rates
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateCalculator;
