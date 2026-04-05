import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator, Package, Truck, Plane, Ship, MapPin } from "lucide-react";

const RateCalculator = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState({ length: "", width: "", height: "" });
  const [serviceType, setServiceType] = useState("");
  const [calculatedRate, setCalculatedRate] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const serviceTypes = [
    { value: "express", label: "Express Delivery", icon: Plane, rate: 2000 }, // INR per kg
    { value: "standard", label: "Standard Shipping", icon: Truck, rate: 1200 }, // INR per kg
    { value: "economy", label: "Economy Shipping", icon: Ship, rate: 800 }, // INR per kg
  ];

  const calculateRate = () => {
    if (!origin || !destination || !weight || !serviceType) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCalculating(true);

    // Simulate API call
    setTimeout(() => {
      const selectedService = serviceTypes.find(service => service.value === serviceType);
      const baseRate = selectedService?.rate || 1200; // Default INR per kg
      const weightNumber = parseFloat(weight);
      const volumetricWeight = dimensions.length && dimensions.width && dimensions.height 
        ? (parseFloat(dimensions.length) * parseFloat(dimensions.width) * parseFloat(dimensions.height)) / 5000
        : 0;
      
      const chargeableWeight = Math.max(weightNumber, volumetricWeight);
      const distance = Math.random() * 5000 + 500; // Random distance for demo
      const rate = baseRate * chargeableWeight + (distance * 8); // INR calculation
      
      setCalculatedRate(Math.round(rate * 100) / 100);
      setIsCalculating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              <Calculator className="inline-block mr-2 mb-1" size={28} />
              Shipping Rate Calculator
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Get instant shipping rates for your packages worldwide
            </p>
            <p className="text-sm text-gray-500 mt-2">
              All rates are in Indian Rupees (₹)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calculator Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package size={24} />
                    Package Details
                  </CardTitle>
                  <CardDescription>
                    Enter your shipment information to calculate shipping rates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Origin and Destination */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origin">Origin Country/City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="origin"
                          placeholder="e.g., New York, USA"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination Country/City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="destination"
                          placeholder="e.g., London, UK"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Enter package weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>

                  {/* Dimensions */}
                  <div className="space-y-2">
                    <Label>Dimensions (cm) - Optional</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Length"
                        value={dimensions.length}
                        onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
                      />
                      <Input
                        placeholder="Width"
                        value={dimensions.width}
                        onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
                      />
                      <Input
                        placeholder="Height"
                        value={dimensions.height}
                        onChange={(e) => setDimensions({...dimensions, height: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Service Type */}
                  <div className="space-y-2">
                    <Label htmlFor="service">Service Type</Label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipping service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            <div className="flex items-center gap-2">
                              <service.icon size={16} />
                              {service.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Calculate Button */}
                  <Button 
                    onClick={calculateRate} 
                    disabled={isCalculating}
                    className="w-full h-12 text-lg"
                  >
                    {isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="mr-2" size={20} />
                        Calculate Rate
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results and Service Types */}
            <div className="space-y-6">
              {/* Rate Result */}
              {calculatedRate !== null && (
                <Card className="shadow-lg border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">Calculated Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ₹{calculatedRate?.toLocaleString('en-IN')}
                      </div>
                      <p className="text-sm text-green-700">
                        Estimated shipping cost (INR)
                      </p>
                      <Button className="w-full mt-4" variant="default">
                        Book This Shipment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Service Types Info */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Available Services</CardTitle>
                  <CardDescription>
                    Choose the service that best fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {serviceTypes.map((service) => (
                    <div key={service.value} className="flex items-center gap-3 p-3 rounded-lg border">
                      <service.icon size={20} className="text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium">{service.label}</div>
                        <div className="text-sm text-gray-600">
                          From ₹{service.rate.toLocaleString('en-IN')}/kg
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Important Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  <p>• Rates are estimates and may vary based on actual shipment details</p>
                  <p>• Volumetric weight may apply for light, bulky items</p>
                  <p>• Additional charges may apply for special handling</p>
                  <p>• Contact us for accurate quotes on large shipments</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateCalculator;