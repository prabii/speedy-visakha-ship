import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Search, Mail, Phone, User } from 'lucide-react';
import { loadServiceLocations, searchServiceLocations, ServiceLocation } from '@/lib/pincodeParser';
import { getStateName } from '@/lib/stateCodes';
import api from '@/lib/api';
import { Footer } from '@/components/Footer';

interface BranchLocation {
  _id?: string;
  address: string;
  mobileNumber: string;
  email: string;
  contactPerson: string;
}

const Locations = () => {
  const [branchLocations, setBranchLocations] = useState<BranchLocation[]>([]);
  const [serviceLocations, setServiceLocations] = useState<ServiceLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load branch locations
  useEffect(() => {
    loadBranchLocations();
  }, []);

  // Load service locations
  useEffect(() => {
    loadServiceLocationsData();
  }, [searchQuery, selectedStateCode]);

  const loadBranchLocations = async () => {
    try {
      const data = await api.branchLocations.getAll({ isActive: true });
      const branches = data.branches || data || [];
      setBranchLocations(branches);
    } catch (error: any) {
      console.error('Error loading branch locations:', error);
      // Fallback to localStorage if API fails
      const stored = localStorage.getItem('branchLocations');
      if (stored) {
        setBranchLocations(JSON.parse(stored));
      } else {
        // Default branch
        const defaultBranch: BranchLocation = {
          _id: '1',
          address: 'PLOT NO 40, SARDAR PATEL SOCIETY 2, SARU SECTION ROAD, JAMNAGAR, GUJARAT',
          mobileNumber: '9537314061',
          email: 'momai.international1@gmail.com',
          contactPerson: 'HITESH MANILAL VADHER',
        };
        setBranchLocations([defaultBranch]);
      }
    }
  };

  const loadServiceLocationsData = async () => {
    setIsLoading(true);
    try {
      const data = await searchServiceLocations(searchQuery, selectedStateCode || undefined);
      setServiceLocations(data);
    } catch (error) {
      console.error('Error loading service locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceAvailable = (location: ServiceLocation): string[] => {
    const services: string[] = [];
    if (location.prepaid === 'Y') services.push('Prepaid');
    if (location.reversePickup === 'Y') services.push('Reverse Pickup');
    if (location.repl === 'Y') services.push('REPL');
    if (location.cod === 'Y') services.push('COD');
    if (location.cash === 'Y') services.push('Cash');
    return services;
  };

  const uniqueStateCodes = Array.from(
    new Set(serviceLocations.map(loc => loc.stateCode))
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <MapPin className="inline-block mr-2 mb-1" size={36} />
              Our Locations
            </h1>
            <p className="text-lg text-gray-600">
              Find our branch locations and service availability by pincode
            </p>
          </div>

          <Tabs defaultValue="branches" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="branches">Branch Locations</TabsTrigger>
              <TabsTrigger value="services">Service Locations</TabsTrigger>
            </TabsList>

            {/* Branch Locations Tab */}
            <TabsContent value="branches" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branchLocations.map((branch, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Branch Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{branch.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a 
                          href={`tel:${branch.mobileNumber}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {branch.mobileNumber}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <a 
                          href={`mailto:${branch.email}`}
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {branch.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <p className="text-sm text-gray-700">{branch.contactPerson}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Service Locations Tab */}
            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Availability by Pincode</CardTitle>
                  <CardDescription>
                    Search for service availability in your area
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search by pincode or district..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={selectedStateCode}
                      onChange={(e) => setSelectedStateCode(e.target.value)}
                      className="px-4 py-2 border rounded-md bg-white"
                    >
                      <option value="">All States</option>
                      {uniqueStateCodes.map(code => (
                        <option key={code} value={code}>
                          {getStateName(code)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pincode</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Services Available</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceLocations.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8">
                                No service locations found
                              </TableCell>
                            </TableRow>
                          ) : (
                            serviceLocations.map((location, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {location.pincode}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{getStateName(location.stateCode)}</div>
                                    <div className="text-xs text-gray-500">{location.stateCode}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{location.district}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {getServiceAvailable(location).map((service, idx) => (
                                      <Badge key={idx} variant="secondary">
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Locations;

