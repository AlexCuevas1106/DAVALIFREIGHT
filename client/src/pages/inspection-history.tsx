
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuth } from '@/hooks/useAuth';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Truck,
  User
} from 'lucide-react';

interface InspectionReport {
  id: number;
  driverId: number;
  vehicleId: number;
  trailerId?: number;
  type: 'pre_trip' | 'post_trip';
  status: 'pending' | 'completed' | 'failed';
  defectsFound: boolean;
  notes?: string;
  inspectionData?: any;
  createdAt: string;
  completedAt?: string;
}

export default function InspectionHistoryPage() {
  const { user: driver } = useAuth();
  const [location, setLocation] = useLocation();
  
  const [inspections, setInspections] = useState<InspectionReport[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trailers, setTrailers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInspection, setSelectedInspection] = useState<InspectionReport | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!driver) {
      setLocation('/');
      return;
    }
    
    fetchData();
  }, [driver, setLocation]);

  const fetchData = async () => {
    if (!driver) return;
    
    setLoading(true);
    try {
      const [inspectionsRes, vehiclesRes, trailersRes] = await Promise.all([
        fetch(`/api/inspections?driverId=${driver.id}`),
        fetch('/api/vehicles'),
        fetch('/api/trailers')
      ]);

      if (inspectionsRes.ok) {
        const inspectionsData = await inspectionsRes.json();
        setInspections(inspectionsData);
      }

      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData);
      }

      if (trailersRes.ok) {
        const trailersData = await trailersRes.json();
        setTrailers(trailersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleName = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} #${vehicle.vehicleNumber}` : `Vehicle #${vehicleId}`;
  };

  const getTrailerName = (trailerId?: number) => {
    if (!trailerId) return 'No trailer';
    const trailer = trailers.find(t => t.id === trailerId);
    return trailer ? `Trailer #${trailer.trailerNumber}` : `Trailer #${trailerId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesType = typeFilter === 'all' || inspection.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    const matchesDate = !dateFilter || new Date(inspection.createdAt).toDateString() === new Date(dateFilter).toDateString();
    const matchesSearch = !searchTerm || 
      getVehicleName(inspection.vehicleId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inspection.notes && inspection.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesType && matchesStatus && matchesDate && matchesSearch;
  });

  const renderInspectionDetails = (inspection: InspectionReport) => {
    if (!inspection.inspectionData) {
      return (
        <div className="p-4 text-center text-gray-500">
          No detailed inspection data available
        </div>
      );
    }

    const { vehicleInfo, sections } = inspection.inspectionData;

    return (
      <div className="space-y-6">
        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Vehicle Number</Label>
              <p className="text-sm">{vehicleInfo?.vehicleNumber || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">License Plate</Label>
              <p className="text-sm">{vehicleInfo?.licensePlate || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Make & Model</Label>
              <p className="text-sm">{`${vehicleInfo?.make || ''} ${vehicleInfo?.model || ''}`.trim() || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Mileage</Label>
              <p className="text-sm">{vehicleInfo?.mileage || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Inspection Sections */}
        {sections && sections.map((section: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {item.status === 'ok' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {item.status === 'defective' && <XCircle className="w-4 h-4 text-red-500" />}
                      {item.status === 'not_applicable' && <div className="w-4 h-4 bg-gray-300 rounded-full" />}
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <Badge className={
                      item.status === 'ok' ? 'bg-green-100 text-green-800' :
                      item.status === 'defective' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (!driver) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <ClipboardCheck className="w-8 h-8 mr-3" />
                  Inspection History & Reports
                </h1>
                <p className="text-gray-600 mt-1">View and manage your vehicle inspection history</p>
              </div>
              <Button onClick={() => setLocation('/inspection')} className="flex items-center space-x-2">
                <ClipboardCheck className="w-4 h-4" />
                <span>New Inspection</span>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history">Inspection History</TabsTrigger>
              <TabsTrigger value="reports">Detailed Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="pre_trip">Pre-Trip</SelectItem>
                          <SelectItem value="post_trip">Post-Trip</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search inspections..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inspections List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">Loading inspections...</div>
                ) : filteredInspections.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No inspections found</h3>
                      <p className="text-gray-600">Try adjusting your filters or create a new inspection.</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredInspections.map((inspection) => (
                    <Card key={inspection.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(inspection.status)}
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-semibold text-lg">
                                    {inspection.type.replace('_', '-').toUpperCase()} Inspection
                                  </h3>
                                  <Badge className={getStatusColor(inspection.status)}>
                                    {inspection.status.toUpperCase()}
                                  </Badge>
                                  {inspection.defectsFound && (
                                    <Badge className="bg-red-100 text-red-800">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      Defects Found
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span className="flex items-center">
                                    <Truck className="w-4 h-4 mr-1" />
                                    {getVehicleName(inspection.vehicleId)}
                                  </span>
                                  <span>{getTrailerName(inspection.trailerId)}</span>
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(inspection.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                {inspection.notes && (
                                  <p className="text-sm text-gray-600 mt-2">
                                    <FileText className="w-4 h-4 inline mr-1" />
                                    {inspection.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedInspection(inspection)}
                              className="flex items-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Details</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              {selectedInspection ? (
                <div className="space-y-6">
                  {/* Report Header */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-6 h-6 mr-2" />
                          Detailed Inspection Report
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(selectedInspection.status)}>
                            {selectedInspection.status.toUpperCase()}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Export PDF
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Inspection ID</Label>
                          <p className="text-sm">#{selectedInspection.id}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Type</Label>
                          <p className="text-sm">{selectedInspection.type.replace('_', '-').toUpperCase()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Vehicle</Label>
                          <p className="text-sm">{getVehicleName(selectedInspection.vehicleId)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Date</Label>
                          <p className="text-sm">{new Date(selectedInspection.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Report Content */}
                  {renderInspectionDetails(selectedInspection)}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Select an Inspection</h3>
                    <p className="text-gray-600">Choose an inspection from the history tab to view its detailed report.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
