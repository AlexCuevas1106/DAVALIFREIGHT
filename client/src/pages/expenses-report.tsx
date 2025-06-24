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
  Truck, 
  Plus, 
  Trash2, 
  Upload,
  MapPin,
  DollarSign,
  FileText,
  Clock
} from "lucide-react";

interface FuelEntry {
  id: string;
  date: string;
  city: string;
  state: string;
  gallons: string;
  cost: string;
  image?: File;
}

interface Destination {
  id: string;
  origin: string;
  destination: string;
}

interface MiscellaneousEntry {
  id: string;
  description: string;
  amount: string;
  date: string;
}

interface MileageEntry {
  id: string;
  date: string;
  odometer: string;
  location: string;
  miles: string;
}

export default function ExpensesReport() {
  const [destinations, setDestinations] = useState<Destination[]>([
    { id: "1", origin: "", destination: "" }
  ]);

  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([
    { id: "1", date: "", city: "", state: "", gallons: "", cost: "" }
  ]);

  const [miscEntries, setMiscEntries] = useState<MiscellaneousEntry[]>([
    { id: "1", description: "", amount: "", date: "" }
  ]);

  const [mileageEntries, setMileageEntries] = useState<MileageEntry[]>([
    { id: "1", date: "", odometer: "", location: "", miles: "" }
  ]);

  // Driver data (you can get this from your dashboard query)
  const driver = {
    id: 1,
    name: "Skyler Droubay",
    status: "on_duty"
  };

  const addDestination = () => {
    if (destinations.length < 4) {
      setDestinations([...destinations, { id: Date.now().toString(), origin: "", destination: "" }]);
    }
  };

  const removeDestination = (id: string) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter(dest => dest.id !== id));
    }
  };

  const updateDestination = (id: string, field: keyof Destination, value: string) => {
    setDestinations(destinations.map(dest => 
      dest.id === id ? { ...dest, [field]: value } : dest
    ));
  };

  const addFuelEntry = () => {
    setFuelEntries([...fuelEntries, { 
      id: Date.now().toString(), 
      date: "", 
      city: "", 
      state: "", 
      gallons: "", 
      cost: "" 
    }]);
  };

  const removeFuelEntry = (id: string) => {
    if (fuelEntries.length > 1) {
      setFuelEntries(fuelEntries.filter(entry => entry.id !== id));
    }
  };

  const updateFuelEntry = (id: string, field: keyof FuelEntry, value: string | File) => {
    setFuelEntries(fuelEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addMiscEntry = () => {
    setMiscEntries([...miscEntries, { 
      id: Date.now().toString(), 
      description: "", 
      amount: "", 
      date: "" 
    }]);
  };

  const removeMiscEntry = (id: string) => {
    if (miscEntries.length > 1) {
      setMiscEntries(miscEntries.filter(entry => entry.id !== id));
    }
  };

  const updateMiscEntry = (id: string, field: keyof MiscellaneousEntry, value: string) => {
    setMiscEntries(miscEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addMileageEntry = () => {
    setMileageEntries([...mileageEntries, { 
      id: Date.now().toString(), 
      date: "", 
      odometer: "", 
      location: "", 
      miles: "" 
    }]);
  };

  const removeMileageEntry = (id: string) => {
    if (mileageEntries.length > 1) {
      setMileageEntries(mileageEntries.filter(entry => entry.id !== id));
    }
  };

  const updateMileageEntry = (id: string, field: keyof MileageEntry, value: string) => {
    setMileageEntries(mileageEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleSaveReport = () => {
    // Here you would save the report data to your backend
    console.log("Saving expenses report...", {
      destinations,
      fuelEntries,
      miscEntries,
      mileageEntries
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main>
        <Header 
          driver={driver}
          status={driver.status}
        />

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Expenses Report</h1>
                <p className="text-gray-600">Track fuel, destinations, and trip expenses</p>
              </div>
              <Button onClick={handleSaveReport} className="bg-blue-600 hover:bg-blue-700">
                <FileText className="w-4 h-4 mr-2" />
                Save Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Destinations Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      Destinations (Max 4)
                    </CardTitle>
                    {destinations.length < 4 && (
                      <Button onClick={addDestination} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {destinations.map((dest, index) => (
                      <div key={dest.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label htmlFor={`origin-${dest.id}`}>Origin {index + 1}</Label>
                          <Input
                            id={`origin-${dest.id}`}
                            value={dest.origin}
                            onChange={(e) => updateDestination(dest.id, "origin", e.target.value)}
                            placeholder="Enter origin location"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`destination-${dest.id}`}>Destination {index + 1}</Label>
                            <Input
                              id={`destination-${dest.id}`}
                              value={dest.destination}
                              onChange={(e) => updateDestination(dest.id, "destination", e.target.value)}
                              placeholder="Enter destination location"
                            />
                          </div>
                          {destinations.length > 1 && (
                            <Button 
                              onClick={() => removeDestination(dest.id)}
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Diesel/Fuel Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2 text-green-600" />
                      Fuel Expenses
                    </CardTitle>
                    <Button onClick={addFuelEntry} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Entry
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fuelEntries.map((entry) => (
                      <div key={entry.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label htmlFor={`fuel-date-${entry.id}`}>Date</Label>
                          <Input
                            id={`fuel-date-${entry.id}`}
                            type="date"
                            value={entry.date}
                            onChange={(e) => updateFuelEntry(entry.id, "date", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`fuel-city-${entry.id}`}>City</Label>
                          <Input
                            id={`fuel-city-${entry.id}`}
                            value={entry.city}
                            onChange={(e) => updateFuelEntry(entry.id, "city", e.target.value)}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`fuel-state-${entry.id}`}>State</Label>
                          <Input
                            id={`fuel-state-${entry.id}`}
                            value={entry.state}
                            onChange={(e) => updateFuelEntry(entry.id, "state", e.target.value)}
                            placeholder="ST"
                            maxLength={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`fuel-gallons-${entry.id}`}>Gallons</Label>
                          <Input
                            id={`fuel-gallons-${entry.id}`}
                            type="number"
                            step="0.01"
                            value={entry.gallons}
                            onChange={(e) => updateFuelEntry(entry.id, "gallons", e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`fuel-cost-${entry.id}`}>Cost ($)</Label>
                          <Input
                            id={`fuel-cost-${entry.id}`}
                            type="number"
                            step="0.01"
                            value={entry.cost}
                            onChange={(e) => updateFuelEntry(entry.id, "cost", e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`fuel-image-${entry.id}`}>Receipt</Label>
                          <div className="flex gap-1">
                            <Input
                              id={`fuel-image-${entry.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) updateFuelEntry(entry.id, "image", file);
                              }}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => document.getElementById(`fuel-image-${entry.id}`)?.click()}
                            >
                              <Upload className="w-3 h-3" />
                            </Button>
                            {fuelEntries.length > 1 && (
                              <Button 
                                onClick={() => removeFuelEntry(entry.id)}
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Miscellaneous Expenses Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                      Miscellaneous Expenses
                    </CardTitle>
                    <Button onClick={addMiscEntry} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Entry
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {miscEntries.map((entry) => (
                      <div key={entry.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                        <div className="md:col-span-2">
                          <Label htmlFor={`misc-desc-${entry.id}`}>Description</Label>
                          <Input
                            id={`misc-desc-${entry.id}`}
                            value={entry.description}
                            onChange={(e) => updateMiscEntry(entry.id, "description", e.target.value)}
                            placeholder="Expense description"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`misc-amount-${entry.id}`}>Amount ($)</Label>
                          <Input
                            id={`misc-amount-${entry.id}`}
                            type="number"
                            step="0.01"
                            value={entry.amount}
                            onChange={(e) => updateMiscEntry(entry.id, "amount", e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`misc-date-${entry.id}`}>Date</Label>
                            <Input
                              id={`misc-date-${entry.id}`}
                              type="date"
                              value={entry.date}
                              onChange={(e) => updateMiscEntry(entry.id, "date", e.target.value)}
                            />
                          </div>
                          {miscEntries.length > 1 && (
                            <Button 
                              onClick={() => removeMiscEntry(entry.id)}
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-orange-600" />
                      Mileage Log
                    </CardTitle>
                    <Button onClick={addMileageEntry} size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {mileageEntries.map((entry) => (
                      <div key={entry.id} className="p-3 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            Entry {mileageEntries.indexOf(entry) + 1}
                          </Badge>
                          {mileageEntries.length > 1 && (
                            <Button 
                              onClick={() => removeMileageEntry(entry.id)}
                              size="sm" 
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 p-1 h-auto"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`mile-date-${entry.id}`} className="text-xs">Date</Label>
                          <Input
                            id={`mile-date-${entry.id}`}
                            type="date"
                            value={entry.date}
                            onChange={(e) => updateMileageEntry(entry.id, "date", e.target.value)}
                            className="text-xs h-8"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`mile-odometer-${entry.id}`} className="text-xs">Odometer</Label>
                          <Input
                            id={`mile-odometer-${entry.id}`}
                            type="number"
                            value={entry.odometer}
                            onChange={(e) => updateMileageEntry(entry.id, "odometer", e.target.value)}
                            placeholder="Miles"
                            className="text-xs h-8"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`mile-location-${entry.id}`} className="text-xs">Location</Label>
                          <Input
                            id={`mile-location-${entry.id}`}
                            value={entry.location}
                            onChange={(e) => updateMileageEntry(entry.id, "location", e.target.value)}
                            placeholder="City, State"
                            className="text-xs h-8"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`mile-miles-${entry.id}`} className="text-xs">Miles Traveled</Label>
                          <Input
                            id={`mile-miles-${entry.id}`}
                            type="number"
                            value={entry.miles}
                            onChange={(e) => updateMileageEntry(entry.id, "miles", e.target.value)}
                            placeholder="0"
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Total Gallons</div>
                      <div className="text-xl font-bold text-green-600">
                        {fuelEntries.reduce((total, entry) => 
                          total + (parseFloat(entry.gallons) || 0), 0
                        ).toFixed(2)} gal
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Total Cost</div>
                      <div className="text-xl font-bold text-green-600">
                        ${fuelEntries.reduce((total, entry) => 
                          total + (parseFloat(entry.cost) || 0), 0
                        ).toFixed(2)}
                      </div>
                    </div>
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