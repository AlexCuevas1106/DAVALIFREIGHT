
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAuth } from '@/hooks/useAuth';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Clock,
  Truck,
  User,
  FileText,
  Save,
  Send
} from 'lucide-react';

interface InspectionItem {
  id: string;
  name: string;
  status: 'ok' | 'defective' | 'not_applicable';
  notes?: string;
}

interface InspectionSection {
  title: string;
  items: InspectionItem[];
}

export default function InspectionPage() {
  const { user: driver } = useAuth();
  const [location, setLocation] = useLocation();
  
  const [inspectionType, setInspectionType] = useState<'pre_trip' | 'post_trip'>('pre_trip');
  const [vehicleInfo, setVehicleInfo] = useState({
    vehicleNumber: '',
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    mileage: '',
    fuelLevel: ''
  });
  
  const [generalNotes, setGeneralNotes] = useState('');
  const [defectsFound, setDefectsFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Driver's Vehicle Inspection Report Sections
  const [sections, setSections] = useState<InspectionSection[]>([
    {
      title: "Engine Compartment",
      items: [
        { id: 'engine_oil', name: 'Engine Oil Level', status: 'ok' },
        { id: 'coolant', name: 'Coolant Level', status: 'ok' },
        { id: 'windshield_fluid', name: 'Windshield Washer Fluid', status: 'ok' },
        { id: 'power_steering', name: 'Power Steering Fluid', status: 'ok' },
        { id: 'belts_hoses', name: 'Belts and Hoses', status: 'ok' },
        { id: 'battery', name: 'Battery and Connections', status: 'ok' },
        { id: 'air_filter', name: 'Air Filter', status: 'ok' },
        { id: 'leaks', name: 'Check for Leaks', status: 'ok' }
      ]
    },
    {
      title: "Cab Safety",
      items: [
        { id: 'seat_belts', name: 'Seat Belts', status: 'ok' },
        { id: 'mirrors', name: 'Mirrors (Rearview/Side)', status: 'ok' },
        { id: 'windshield', name: 'Windshield', status: 'ok' },
        { id: 'wipers', name: 'Windshield Wipers', status: 'ok' },
        { id: 'horn', name: 'Horn', status: 'ok' },
        { id: 'heater_defroster', name: 'Heater/Defroster', status: 'ok' },
        { id: 'parking_brake', name: 'Parking Brake', status: 'ok' },
        { id: 'steering', name: 'Steering', status: 'ok' },
        { id: 'lights_reflectors', name: 'Lights and Reflectors', status: 'ok' },
        { id: 'gauges', name: 'Gauges', status: 'ok' }
      ]
    },
    {
      title: "External Inspection",
      items: [
        { id: 'tires_wheels', name: 'Tires and Wheels', status: 'ok' },
        { id: 'rims_lugs', name: 'Rims and Lug Nuts', status: 'ok' },
        { id: 'hub_oil_seals', name: 'Hub Oil Seals', status: 'ok' },
        { id: 'brakes', name: 'Brakes', status: 'ok' },
        { id: 'brake_chambers', name: 'Brake Chambers', status: 'ok' },
        { id: 'brake_hoses', name: 'Brake Hoses', status: 'ok' },
        { id: 'suspension', name: 'Suspension System', status: 'ok' },
        { id: 'exhaust_system', name: 'Exhaust System', status: 'ok' },
        { id: 'frame_body', name: 'Frame and Body', status: 'ok' },
        { id: 'coupling_devices', name: 'Coupling Devices', status: 'ok' },
        { id: 'tie_downs', name: 'Tie Downs/Chains/Binders', status: 'ok' },
        { id: 'spare_tire', name: 'Spare Tire', status: 'ok' }
      ]
    }
  ]);

  useEffect(() => {
    if (!driver) {
      setLocation('/');
      return;
    }
    
    // Load vehicle info if available
    fetchVehicleInfo();
  }, [driver, navigate]);

  const fetchVehicleInfo = async () => {
    if (!driver?.currentVehicleId) return;
    
    try {
      const response = await fetch(`/api/vehicles/${driver.currentVehicleId}`);
      if (response.ok) {
        const vehicle = await response.json();
        setVehicleInfo({
          vehicleNumber: vehicle.vehicleNumber || '',
          make: vehicle.make || '',
          model: vehicle.model || '',
          year: vehicle.year?.toString() || '',
          licensePlate: vehicle.licensePlate || '',
          mileage: vehicle.mileage?.toString() || '',
          fuelLevel: vehicle.fuelLevel?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Error fetching vehicle info:', error);
    }
  };

  const updateItemStatus = (sectionIndex: number, itemId: string, status: 'ok' | 'defective' | 'not_applicable') => {
    setSections(prev => prev.map((section, index) => {
      if (index === sectionIndex) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, status } : item
          )
        };
      }
      return section;
    }));
    
    // Update defects found status
    const hasDefects = sections.some(section => 
      section.items.some(item => item.status === 'defective')
    );
    setDefectsFound(hasDefects);
  };

  const updateItemNotes = (sectionIndex: number, itemId: string, notes: string) => {
    setSections(prev => prev.map((section, index) => {
      if (index === sectionIndex) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, notes } : item
          )
        };
      }
      return section;
    }));
  };

  const handleSubmit = async (status: 'completed' | 'pending') => {
    if (!driver) return;
    
    setIsSubmitting(true);
    
    try {
      const inspectionData = {
        driverId: driver.id,
        vehicleId: driver.currentVehicleId,
        trailerId: driver.currentTrailerId,
        type: inspectionType,
        status,
        defectsFound,
        notes: generalNotes || null,
        inspectionData: {
          vehicleInfo,
          sections
        }
      };

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inspectionData),
      });

      if (response.ok) {
        setLocation('/dashboard');
      } else {
        console.error('Failed to submit inspection');
      }
    } catch (error) {
      console.error('Error submitting inspection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'defective':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'not_applicable':
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 text-green-800';
      case 'defective':
        return 'bg-red-100 text-red-800';
      case 'not_applicable':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!driver) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <ClipboardCheck className="w-8 h-8 mr-3" />
                    Driver's Vehicle Inspection Report
                  </h1>
                  <p className="text-gray-600 mt-1">Complete your vehicle inspection checklist</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString()}</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date().toLocaleTimeString()}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Inspection Type and Driver Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Driver Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Driver Name</Label>
                    <Input value={driver.name} readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>License Number</Label>
                    <Input value={driver.licenseNumber || ''} readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Inspection Type</Label>
                    <Select value={inspectionType} onValueChange={(value: 'pre_trip' | 'post_trip') => setInspectionType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pre_trip">Pre-Trip Inspection</SelectItem>
                        <SelectItem value="post_trip">Post-Trip Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Vehicle Number</Label>
                      <Input 
                        value={vehicleInfo.vehicleNumber} 
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>License Plate</Label>
                      <Input 
                        value={vehicleInfo.licensePlate} 
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, licensePlate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Make</Label>
                      <Input 
                        value={vehicleInfo.make} 
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, make: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Model</Label>
                      <Input 
                        value={vehicleInfo.model} 
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, model: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input 
                        value={vehicleInfo.year} 
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, year: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Mileage</Label>
                      <Input 
                        value={vehicleInfo.mileage} 
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, mileage: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Fuel Level (%)</Label>
                      <Input 
                        value={vehicleInfo.fuelLevel} 
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, fuelLevel: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inspection Sections */}
            <Tabs defaultValue="0" className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                {sections.map((section, index) => (
                  <TabsTrigger key={index} value={index.toString()}>
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {sections.map((section, sectionIndex) => (
                <TabsContent key={sectionIndex} value={sectionIndex.toString()}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {section.items.map((item, itemIndex) => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(item.status)}
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${item.id}-ok`}
                                  checked={item.status === 'ok'}
                                  onCheckedChange={() => updateItemStatus(sectionIndex, item.id, 'ok')}
                                />
                                <Label htmlFor={`${item.id}-ok`} className="text-green-600">OK</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${item.id}-defective`}
                                  checked={item.status === 'defective'}
                                  onCheckedChange={() => updateItemStatus(sectionIndex, item.id, 'defective')}
                                />
                                <Label htmlFor={`${item.id}-defective`} className="text-red-600">Defective</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${item.id}-na`}
                                  checked={item.status === 'not_applicable'}
                                  onCheckedChange={() => updateItemStatus(sectionIndex, item.id, 'not_applicable')}
                                />
                                <Label htmlFor={`${item.id}-na`} className="text-gray-600">N/A</Label>
                              </div>
                            </div>
                            
                            {item.status === 'defective' && (
                              <div className="mt-3">
                                <Label>Defect Details</Label>
                                <Textarea
                                  placeholder="Describe the defect..."
                                  value={item.notes || ''}
                                  onChange={(e) => updateItemNotes(sectionIndex, item.id, e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            {/* General Notes */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  General Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any additional notes or observations..."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Defects Summary */}
            {defectsFound && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-700">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Defects Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sections.map((section, sectionIndex) => 
                      section.items
                        .filter(item => item.status === 'defective')
                        .map(item => (
                          <div key={item.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="font-medium">{section.title}: {item.name}</span>
                            {item.notes && (
                              <span className="text-gray-600 text-sm">- {item.notes}</span>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Complete your inspection and submit for review
                  </p>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handleSubmit('pending')}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Draft</span>
                    </Button>
                    <Button 
                      onClick={() => handleSubmit('completed')}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Inspection</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
