import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Camera, 
  FileText, 
  Download,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TripRecord {
  id: string;
  loadNumber: string;
  emptyFrom: string;
  emptyTo: string;
  loadedFrom: string;
  loadedTo: string;
  startOdometer: string;
  finishOdometer: string;
  totalMiles: string;
}

interface FuelEntry {
  id: string;
  date: string;
  city: string;
  state: string;
  gallons: number;
  cost: number;
  image: File | null;
}

interface MiscellaneousEntry {
  id: string;
  description: string;
  amount: number;
  category: string;
}

interface MileageEntry {
  id: string;
  state: string;
  odometerReading: string;
  highwaysTraveled: string;
  milesLoaded: string;
  milesEmpty: string;
}

export default function ExpensesReport() {
  const [tripRecord, setTripRecord] = useState<TripRecord>({
    id: '1',
    loadNumber: '',
    emptyFrom: '',
    emptyTo: '',
    loadedFrom: '',
    loadedTo: '',
    startOdometer: '',
    finishOdometer: '',
    totalMiles: ''
  });

  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([
    { id: '1', date: '', city: '', state: '', gallons: 0, cost: 0, image: null }
  ]);

  const [miscEntries, setMiscEntries] = useState<MiscellaneousEntry[]>([
    { id: '1', description: '', amount: 0, category: '' }
  ]);

  const [mileageEntries, setMileageEntries] = useState<MileageEntry[]>([
    { id: '1', state: '', odometerReading: '', highwaysTraveled: '', milesLoaded: '', milesEmpty: '' }
  ]);

  // Mock driver data
  const driver = {
    id: 1,
    name: "Skyler Droubay",
    role: "driver"
  };

  const addFuelEntry = () => {
    const newEntry: FuelEntry = {
      id: Date.now().toString(),
      date: '',
      city: '',
      state: '',
      gallons: 0,
      cost: 0,
      image: null
    };
    setFuelEntries([...fuelEntries, newEntry]);
  };

  const removeFuelEntry = (id: string) => {
    setFuelEntries(fuelEntries.filter(entry => entry.id !== id));
  };

  const updateFuelEntry = (id: string, field: keyof FuelEntry, value: any) => {
    setFuelEntries(fuelEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addMiscEntry = () => {
    const newEntry: MiscellaneousEntry = {
      id: Date.now().toString(),
      description: '',
      amount: 0,
      category: ''
    };
    setMiscEntries([...miscEntries, newEntry]);
  };

  const removeMiscEntry = (id: string) => {
    setMiscEntries(miscEntries.filter(entry => entry.id !== id));
  };

  const updateMiscEntry = (id: string, field: keyof MiscellaneousEntry, value: any) => {
    setMiscEntries(miscEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addMileageEntry = () => {
    const newEntry: MileageEntry = {
      id: Date.now().toString(),
      state: '',
      odometerReading: '',
      highwaysTraveled: '',
      milesLoaded: '',
      milesEmpty: ''
    };
    setMileageEntries([...mileageEntries, newEntry]);
  };

  const removeMileageEntry = (id: string) => {
    setMileageEntries(mileageEntries.filter(entry => entry.id !== id));
  };

  const updateMileageEntry = (id: string, field: keyof MileageEntry, value: any) => {
    setMileageEntries(mileageEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const totalGallons = fuelEntries.reduce((sum, entry) => sum + (entry.gallons || 0), 0);
  const totalFuelCost = fuelEntries.reduce((sum, entry) => sum + (entry.cost || 0), 0);
  const totalMiscCost = miscEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);

  const handleImageUpload = (entryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateFuelEntry(entryId, 'image', file);
    }
  };

  const generatePDF = () => {
    // Create a new window with the report content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Trip Record - Davali Freight Company</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px; 
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #000; 
              padding-bottom: 10px; 
            }
            .section { 
              margin-bottom: 20px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 15px; 
            }
            th, td { 
              border: 1px solid #000; 
              padding: 5px; 
              text-align: left; 
            }
            th { 
              background-color: #f0f0f0; 
              font-weight: bold; 
            }
            .totals { 
              background-color: #e0e0e0; 
              font-weight: bold; 
            }
            .trip-info { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 20px; 
              margin-bottom: 20px; 
            }
            .company-info {
              text-align: left;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <strong>Davali Freight Company LLC</strong><br>
              9750 Via De La Amistad Suite 6 AP<br>
              San Diego, California 92154<br>
              Tel: 619-240-4876
            </div>
            <h1>TRIP RECORD</h1>
            <p>State law requires complete and accurate record be filled out for each trip.</p>
          </div>

          <div class="trip-info">
            <div>
              <strong>Load No:</strong> ${tripRecord.loadNumber}<br>
              <strong>Empty From:</strong> ${tripRecord.emptyFrom}<br>
              <strong>Loaded From:</strong> ${tripRecord.loadedFrom}<br>
              <strong>Start Odometer:</strong> ${tripRecord.startOdometer}
            </div>
            <div>
              <strong>Empty To:</strong> ${tripRecord.emptyTo}<br>
              <strong>Loaded To:</strong> ${tripRecord.loadedTo}<br>
              <strong>Finish Odometer:</strong> ${tripRecord.finishOdometer}<br>
              <strong>Total Miles:</strong> ${tripRecord.totalMiles}
            </div>
          </div>

          <div class="section">
            <h3>TRUCK FUEL</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Gallons</th>
                  <th>Cost</th>
                  <th>Price per Gallon</th>
                </tr>
              </thead>
              <tbody>
                ${fuelEntries.map(entry => entry.date || entry.city || entry.state || entry.gallons || entry.cost ? `
                  <tr>
                    <td>${entry.date}</td>
                    <td>${entry.city}</td>
                    <td>${entry.state}</td>
                    <td>${entry.gallons}</td>
                    <td>$${entry.cost.toFixed(2)}</td>
                    <td>$${entry.gallons > 0 ? (entry.cost / entry.gallons).toFixed(2) : '0.00'}</td>
                  </tr>
                ` : '').join('')}
                <tr class="totals">
                  <td colspan="3"><strong>TOTAL:</strong></td>
                  <td><strong>${totalGallons.toFixed(2)}</strong></td>
                  <td><strong>$${totalFuelCost.toFixed(2)}</strong></td>
                  <td><strong>$${totalGallons > 0 ? (totalFuelCost / totalGallons).toFixed(2) : '0.00'}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3>MISCELLANEOUS EXPENSES</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${miscEntries.map(entry => entry.description || entry.category || entry.amount ? `
                  <tr>
                    <td>${entry.description}</td>
                    <td>${entry.category}</td>
                    <td>$${entry.amount.toFixed(2)}</td>
                  </tr>
                ` : '').join('')}
                <tr class="totals">
                  <td colspan="2"><strong>TOTAL:</strong></td>
                  <td><strong>$${totalMiscCost.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3>MILEAGE REPORT</h3>
            <table>
              <thead>
                <tr>
                  <th>State</th>
                  <th>Odometer Reading</th>
                  <th>Highways Traveled</th>
                  <th>Miles Loaded</th>
                  <th>Miles Empty</th>
                </tr>
              </thead>
              <tbody>
                ${mileageEntries.map(entry => entry.state || entry.odometerReading || entry.highwaysTraveled || entry.milesLoaded || entry.milesEmpty ? `
                  <tr>
                    <td>${entry.state}</td>
                    <td>${entry.odometerReading}</td>
                    <td>${entry.highwaysTraveled}</td>
                    <td>${entry.milesLoaded}</td>
                    <td>${entry.milesEmpty}</td>
                  </tr>
                ` : '').join('')}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 40px;">
            <p>I certify this record to be true and correct. Driver's Signature: _________________________</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const createNewReport = () => {
    setTripRecord({
      id: Date.now().toString(),
      loadNumber: '',
      emptyFrom: '',
      emptyTo: '',
      loadedFrom: '',
      loadedTo: '',
      startOdometer: '',
      finishOdometer: '',
      totalMiles: ''
    });
    setFuelEntries([{ id: '1', date: '', city: '', state: '', gallons: 0, cost: 0, image: null }]);
    setMiscEntries([{ id: '1', description: '', amount: 0, category: '' }]);
    setMileageEntries([{ id: '1', state: '', odometerReading: '', highwaysTraveled: '', milesLoaded: '', milesEmpty: '' }]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <main>
        <Header 
          driver={driver}
          status="on_duty"
        />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trip Record</h1>
              <p className="text-gray-600">State law requires complete and accurate record be filled out for each trip.</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={createNewReport}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Report</span>
              </Button>
              <Button 
                onClick={generatePDF}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Save Report</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Trip Info and Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Trip Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="loadNumber">Load Number</Label>
                      <Input
                        id="loadNumber"
                        value={tripRecord.loadNumber}
                        onChange={(e) => setTripRecord({...tripRecord, loadNumber: e.target.value})}
                        placeholder="Enter load number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalMiles">Total Miles</Label>
                      <Input
                        id="totalMiles"
                        value={tripRecord.totalMiles}
                        onChange={(e) => setTripRecord({...tripRecord, totalMiles: e.target.value})}
                        placeholder="Enter total miles"
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Origin - Destination</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="emptyFrom">Empty From</Label>
                          <Input
                            id="emptyFrom"
                            value={tripRecord.emptyFrom}
                            onChange={(e) => setTripRecord({...tripRecord, emptyFrom: e.target.value})}
                            placeholder="City, State"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emptyTo">Empty To</Label>
                          <Input
                            id="emptyTo"
                            value={tripRecord.emptyTo}
                            onChange={(e) => setTripRecord({...tripRecord, emptyTo: e.target.value})}
                            placeholder="City, State"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loadedFrom">Loaded From</Label>
                          <Input
                            id="loadedFrom"
                            value={tripRecord.loadedFrom}
                            onChange={(e) => setTripRecord({...tripRecord, loadedFrom: e.target.value})}
                            placeholder="City, State"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loadedTo">Loaded To</Label>
                          <Input
                            id="loadedTo"
                            value={tripRecord.loadedTo}
                            onChange={(e) => setTripRecord({...tripRecord, loadedTo: e.target.value})}
                            placeholder="City, State"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Odometer Readings</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="startOdometer">Start Odometer</Label>
                          <Input
                            id="startOdometer"
                            value={tripRecord.startOdometer}
                            onChange={(e) => setTripRecord({...tripRecord, startOdometer: e.target.value})}
                            placeholder="Starting mileage"
                          />
                        </div>
                        <div>
                          <Label htmlFor="finishOdometer">Finish Odometer</Label>
                          <Input
                            id="finishOdometer"
                            value={tripRecord.finishOdometer}
                            onChange={(e) => setTripRecord({...tripRecord, finishOdometer: e.target.value})}
                            placeholder="Ending mileage"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fuel Expenses */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Truck Fuel</CardTitle>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-sm">
                        Total: {totalGallons.toFixed(2)} gal | ${totalFuelCost.toFixed(2)}
                      </Badge>
                      <Button
                        onClick={addFuelEntry}
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Entry</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fuelEntries.map((entry, index) => (
                      <div key={entry.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium">Fuel Entry #{index + 1}</h5>
                          {fuelEntries.length > 1 && (
                            <Button
                              onClick={() => removeFuelEntry(entry.id)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          <div>
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={entry.date}
                              onChange={(e) => updateFuelEntry(entry.id, 'date', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>City</Label>
                            <Input
                              value={entry.city}
                              onChange={(e) => updateFuelEntry(entry.id, 'city', e.target.value)}
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <Label>State</Label>
                            <Input
                              value={entry.state}
                              onChange={(e) => updateFuelEntry(entry.id, 'state', e.target.value)}
                              placeholder="State"
                              maxLength={2}
                            />
                          </div>
                          <div>
                            <Label>Gallons</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={entry.gallons || ''}
                              onChange={(e) => updateFuelEntry(entry.id, 'gallons', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label>Cost ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={entry.cost || ''}
                              onChange={(e) => updateFuelEntry(entry.id, 'cost', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label>Receipt Image</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(entry.id, e)}
                                className="hidden"
                                id={`image-${entry.id}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`image-${entry.id}`)?.click()}
                                className="flex items-center space-x-1"
                              >
                                <Camera className="w-4 h-4" />
                                <span>{entry.image ? 'Change' : 'Add'}</span>
                              </Button>
                              {entry.image && (
                                <Badge variant="secondary" className="text-xs">
                                  {entry.image.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Miscellaneous Expenses */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Miscellaneous Expenses</CardTitle>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-sm">
                        Total: ${totalMiscCost.toFixed(2)}
                      </Badge>
                      <Button
                        onClick={addMiscEntry}
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Entry</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {miscEntries.map((entry, index) => (
                      <div key={entry.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium">Misc Entry #{index + 1}</h5>
                          {miscEntries.length > 1 && (
                            <Button
                              onClick={() => removeMiscEntry(entry.id)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={entry.description}
                              onChange={(e) => updateMiscEntry(entry.id, 'description', e.target.value)}
                              placeholder="Describe the expense"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Category</Label>
                            <Input
                              value={entry.category}
                              onChange={(e) => updateMiscEntry(entry.id, 'category', e.target.value)}
                              placeholder="e.g., Tolls, Meals, Parking"
                            />
                          </div>
                          <div>
                            <Label>Amount ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={entry.amount || ''}
                              onChange={(e) => updateMiscEntry(entry.id, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Mileage Log */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Mileage Log</CardTitle>
                    <Button
                      onClick={addMileageEntry}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mileageEntries.map((entry, index) => (
                      <div key={entry.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-medium text-sm">Entry #{index + 1}</h6>
                          {mileageEntries.length > 1 && (
                            <Button
                              onClick={() => removeMileageEntry(entry.id)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs">State</Label>
                            <Input
                              value={entry.state}
                              onChange={(e) => updateMileageEntry(entry.id, 'state', e.target.value)}
                              placeholder="State"
                              className="text-sm"
                              maxLength={2}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Odometer Reading</Label>
                            <Input
                              value={entry.odometerReading}
                              onChange={(e) => updateMileageEntry(entry.id, 'odometerReading', e.target.value)}
                              placeholder="Reading"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Highways Traveled</Label>
                            <Input
                              value={entry.highwaysTraveled}
                              onChange={(e) => updateMileageEntry(entry.id, 'highwaysTraveled', e.target.value)}
                              placeholder="I-5, US-101"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Miles Loaded</Label>
                            <Input
                              type="number"
                              value={entry.milesLoaded}
                              onChange={(e) => updateMileageEntry(entry.id, 'milesLoaded', e.target.value)}
                              placeholder="0"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Miles Empty</Label>
                            <Input
                              type="number"
                              value={entry.milesEmpty}
                              onChange={(e) => updateMileageEntry(entry.id, 'milesEmpty', e.target.value)}
                              placeholder="0"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}