import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  CreditCard, 
  CheckCircle,
  Truck,
  Plane,
  Ship,
  Shield,
  Clock
} from "lucide-react";

const BookShipment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Sender Information
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    senderAddress: "",
    senderCity: "",
    senderCountry: "",
    senderPostal: "",
    
    // Receiver Information
    receiverName: "",
    receiverEmail: "",
    receiverPhone: "",
    receiverAddress: "",
    receiverCity: "",
    receiverCountry: "",
    receiverPostal: "",
    
    // Package Information
    packageType: "",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    description: "",
    value: "",
    
    // Service Information
    serviceType: "",
    pickupDate: "",
    deliveryInstructions: "",
    insurance: false,
    
    // Payment Information
    paymentMethod: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");

  const serviceTypes = [
    { 
      value: "express", 
      label: "Express Delivery", 
      icon: Plane, 
      time: "1-3 business days",
      price: "$25/kg"
    },
    { 
      value: "standard", 
      label: "Standard Shipping", 
      icon: Truck, 
      time: "3-7 business days",
      price: "$15/kg"
    },
    { 
      value: "economy", 
      label: "Economy Shipping", 
      icon: Ship, 
      time: "7-14 business days",
      price: "$8/kg"
    },
  ];

  const packageTypes = [
    "Documents",
    "Electronics",
    "Clothing",
    "Books",
    "Gifts",
    "Food Items",
    "Medical Supplies",
    "Other"
  ];

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const trackingNum = `VIC${Date.now().toString().slice(-8)}`;
      setTrackingNumber(trackingNum);
      setBookingComplete(true);
      setIsSubmitting(false);
    }, 3000);
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Booking Confirmed!</CardTitle>
            <CardDescription className="text-lg">
              Your shipment has been successfully booked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Tracking Number</h3>
              <div className="text-2xl font-bold text-green-600 mb-4">{trackingNumber}</div>
              <p className="text-sm text-green-700">
                Save this tracking number to monitor your shipment status
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Sender Details
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {formData.senderName}</p>
                  <p><strong>Email:</strong> {formData.senderEmail}</p>
                  <p><strong>Phone:</strong> {formData.senderPhone}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Receiver Details
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {formData.receiverName}</p>
                  <p><strong>Email:</strong> {formData.receiverEmail}</p>
                  <p><strong>Phone:</strong> {formData.receiverPhone}</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.print()} variant="outline">
                Print Receipt
              </Button>
              <Button onClick={() => setBookingComplete(false)}>
                Book Another Shipment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <Package className="inline-block mr-2 mb-1" size={36} />
              Book Your Shipment
            </h1>
            <p className="text-lg text-gray-600">
              Quick and easy international shipping booking
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-8">
              <Tabs value={currentStep.toString()} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="1">Sender</TabsTrigger>
                  <TabsTrigger value="2">Receiver</TabsTrigger>
                  <TabsTrigger value="3">Package</TabsTrigger>
                  <TabsTrigger value="4">Payment</TabsTrigger>
                </TabsList>

                {/* Step 1: Sender Information */}
                <TabsContent value="1" className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold mb-2">Sender Information</h2>
                    <p className="text-gray-600">Enter the sender's details</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="senderName">Full Name *</Label>
                      <Input
                        id="senderName"
                        value={formData.senderName}
                        onChange={(e) => handleInputChange('senderName', e.target.value)}
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="senderEmail">Email Address *</Label>
                      <Input
                        id="senderEmail"
                        type="email"
                        value={formData.senderEmail}
                        onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="senderPhone">Phone Number *</Label>
                      <Input
                        id="senderPhone"
                        value={formData.senderPhone}
                        onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="senderCountry">Country *</Label>
                      <Input
                        id="senderCountry"
                        value={formData.senderCountry}
                        onChange={(e) => handleInputChange('senderCountry', e.target.value)}
                        placeholder="Enter country"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="senderAddress">Complete Address *</Label>
                      <Textarea
                        id="senderAddress"
                        value={formData.senderAddress}
                        onChange={(e) => handleInputChange('senderAddress', e.target.value)}
                        placeholder="Enter complete address"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="senderCity">City *</Label>
                      <Input
                        id="senderCity"
                        value={formData.senderCity}
                        onChange={(e) => handleInputChange('senderCity', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="senderPostal">Postal Code</Label>
                      <Input
                        id="senderPostal"
                        value={formData.senderPostal}
                        onChange={(e) => handleInputChange('senderPostal', e.target.value)}
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Step 2: Receiver Information */}
                <TabsContent value="2" className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold mb-2">Receiver Information</h2>
                    <p className="text-gray-600">Enter the receiver's details</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="receiverName">Full Name *</Label>
                      <Input
                        id="receiverName"
                        value={formData.receiverName}
                        onChange={(e) => handleInputChange('receiverName', e.target.value)}
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receiverEmail">Email Address *</Label>
                      <Input
                        id="receiverEmail"
                        type="email"
                        value={formData.receiverEmail}
                        onChange={(e) => handleInputChange('receiverEmail', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receiverPhone">Phone Number *</Label>
                      <Input
                        id="receiverPhone"
                        value={formData.receiverPhone}
                        onChange={(e) => handleInputChange('receiverPhone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receiverCountry">Country *</Label>
                      <Input
                        id="receiverCountry"
                        value={formData.receiverCountry}
                        onChange={(e) => handleInputChange('receiverCountry', e.target.value)}
                        placeholder="Enter country"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="receiverAddress">Complete Address *</Label>
                      <Textarea
                        id="receiverAddress"
                        value={formData.receiverAddress}
                        onChange={(e) => handleInputChange('receiverAddress', e.target.value)}
                        placeholder="Enter complete address"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receiverCity">City *</Label>
                      <Input
                        id="receiverCity"
                        value={formData.receiverCity}
                        onChange={(e) => handleInputChange('receiverCity', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receiverPostal">Postal Code</Label>
                      <Input
                        id="receiverPostal"
                        value={formData.receiverPostal}
                        onChange={(e) => handleInputChange('receiverPostal', e.target.value)}
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Step 3: Package Information */}
                <TabsContent value="3" className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold mb-2">Package Information</h2>
                    <p className="text-gray-600">Provide package details and select service</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="packageType">Package Type *</Label>
                        <Select value={formData.packageType} onValueChange={(value) => handleInputChange('packageType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select package type" />
                          </SelectTrigger>
                          <SelectContent>
                            {packageTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={formData.weight}
                          onChange={(e) => handleInputChange('weight', e.target.value)}
                          placeholder="Enter weight"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="value">Declared Value (USD)</Label>
                        <Input
                          id="value"
                          type="number"
                          value={formData.value}
                          onChange={(e) => handleInputChange('value', e.target.value)}
                          placeholder="Enter package value"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pickupDate">Preferred Pickup Date</Label>
                        <Input
                          id="pickupDate"
                          type="date"
                          value={formData.pickupDate}
                          onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Dimensions (cm) - Optional</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Length"
                          value={formData.dimensions.length}
                          onChange={(e) => handleInputChange('dimensions.length', e.target.value)}
                        />
                        <Input
                          placeholder="Width"
                          value={formData.dimensions.width}
                          onChange={(e) => handleInputChange('dimensions.width', e.target.value)}
                        />
                        <Input
                          placeholder="Height"
                          value={formData.dimensions.height}
                          onChange={(e) => handleInputChange('dimensions.height', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Package Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe the contents of your package"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label>Select Service Type *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {serviceTypes.map((service) => (
                          <Card
                            key={service.value}
                            className={`cursor-pointer border-2 transition-colors ${
                              formData.serviceType === service.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleInputChange('serviceType', service.value)}
                          >
                            <CardContent className="p-4 text-center">
                              <service.icon className="mx-auto mb-2 text-blue-600" size={32} />
                              <h3 className="font-semibold">{service.label}</h3>
                              <p className="text-sm text-gray-600 mt-1">{service.time}</p>
                              <p className="text-sm font-medium text-blue-600 mt-1">{service.price}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="insurance"
                        checked={formData.insurance}
                        onCheckedChange={(checked) => handleInputChange('insurance', checked.toString())}
                      />
                      <Label htmlFor="insurance" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Add Insurance Coverage (+$5)
                      </Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                      <Textarea
                        id="deliveryInstructions"
                        value={formData.deliveryInstructions}
                        onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                        placeholder="Any special delivery instructions"
                        rows={2}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Step 4: Payment */}
                <TabsContent value="4" className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold mb-2">Payment & Confirmation</h2>
                    <p className="text-gray-600">Review your booking and complete payment</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span>Service Type:</span>
                            <span className="font-medium">{serviceTypes.find(s => s.value === formData.serviceType)?.label || 'Not selected'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Package Weight:</span>
                            <span className="font-medium">{formData.weight || '0'} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>From:</span>
                            <span className="font-medium">{formData.senderCity || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>To:</span>
                            <span className="font-medium">{formData.receiverCity || 'Not specified'}</span>
                          </div>
                          {formData.insurance && (
                            <div className="flex justify-between">
                              <span>Insurance:</span>
                              <span className="font-medium">$5.00</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Estimated Total:</span>
                            <span>$45.00</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label>Payment Method *</Label>
                        <div className="space-y-2">
                          {['Credit Card', 'PayPal', 'Bank Transfer', 'Cash on Pickup'].map((method) => (
                            <Card
                              key={method}
                              className={`cursor-pointer border-2 transition-colors ${
                                formData.paymentMethod === method
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleInputChange('paymentMethod', method)}
                            >
                              <CardContent className="p-3 flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                <span>{method}</span>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    disabled={
                      (currentStep === 1 && (!formData.senderName || !formData.senderEmail)) ||
                      (currentStep === 2 && (!formData.receiverName || !formData.receiverEmail)) ||
                      (currentStep === 3 && (!formData.packageType || !formData.weight || !formData.serviceType))
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.paymentMethod}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookShipment;