import { useState } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Camera,
  FileText,
  Download,
  RotateCcw,
  Receipt,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TripRecord {
  id: string;
  loadNumber: string;
  From: string;
  To: string;
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

const EXPENSE_CATEGORIES = [
  "Tolls",
  "Parking",
  "Meals",
  "Lodging",
  "Maintenance",
  "Communication",
  "Permits",
  "Medical",
  "Safety Equipment",
  "Other",
];

export default function ExpensesReport() {
  const [tripRecord, setTripRecord] = useState<TripRecord>({
    id: "1",
    loadNumber: "",
    From: "",
    To: "",
    startOdometer: "",
    finishOdometer: "",
    totalMiles: "",
  });

  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([
    {
      id: "1",
      date: "",
      city: "",
      state: "",
      gallons: 0,
      cost: 0,
      image: null,
    },
  ]);

  const [miscEntries, setMiscEntries] = useState<MiscellaneousEntry[]>([
    { id: "1", description: "", amount: 0, category: "" },
  ]);

  const [mileageEntries, setMileageEntries] = useState<MileageEntry[]>([
    {
      id: "1",
      state: "",
      odometerReading: "",
      highwaysTraveled: "",
      milesLoaded: "",
      milesEmpty: "",
    },
  ]);

  // Mock driver data
  const driver = {
    id: 1,
    name: "Skyler Droubay",
    role: "driver",
  };

  const addFuelEntry = () => {
    const newEntry: FuelEntry = {
      id: Date.now().toString(),
      date: "",
      city: "",
      state: "",
      gallons: 0,
      cost: 0,
      image: null,
    };
    setFuelEntries([...fuelEntries, newEntry]);
  };

  const addMiscEntry = () => {
    const newEntry: MiscellaneousEntry = {
      id: Date.now().toString(),
      description: "",
      amount: 0,
      category: "",
    };
    setMiscEntries([...miscEntries, newEntry]);
  };

  const addMileageEntry = () => {
    const newEntry: MileageEntry = {
      id: Date.now().toString(),
      state: "",
      odometerReading: "",
      highwaysTraveled: "",
      milesLoaded: "",
      milesEmpty: "",
    };
    setMileageEntries([...mileageEntries, newEntry]);
  };

  const updateFuelEntry = (id: string, field: keyof FuelEntry, value: any) => {
    setFuelEntries(
      fuelEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const updateMiscEntry = (
    id: string,
    field: keyof MiscellaneousEntry,
    value: any,
  ) => {
    setMiscEntries(
      miscEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const updateMileageEntry = (
    id: string,
    field: keyof MileageEntry,
    value: any,
  ) => {
    setMileageEntries(
      mileageEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const deleteFuelEntry = (id: string) => {
    if (fuelEntries.length > 1) {
      setFuelEntries(fuelEntries.filter((entry) => entry.id !== id));
    }
  };

  const deleteMiscEntry = (id: string) => {
    if (miscEntries.length > 1) {
      setMiscEntries(miscEntries.filter((entry) => entry.id !== id));
    }
  };

  const deleteMileageEntry = (id: string) => {
    if (mileageEntries.length > 1) {
      setMileageEntries(mileageEntries.filter((entry) => entry.id !== id));
    }
  };

  const handleImageUpload = (id: string, file: File) => {
    updateFuelEntry(id, "image", file);
  };

  const updateTripRecord = (field: keyof TripRecord, value: string) => {
    setTripRecord((prev) => ({ ...prev, [field]: value }));
  };

  const generatePDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Trip Report - ${tripRecord.loadNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { text-align: right; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DAVALI FREIGHT COMPANY</h1>
            <h2>TRIP EXPENSE REPORT</h2>
            <p>Driver: ${driver.name}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h3>Trip Record</h3>
            <table>
              <tr><td><strong>Load Number:</strong></td><td>${tripRecord.loadNumber}</td></tr>
              <tr><td><strong>Empty From:</strong></td><td>${tripRecord.From}</td></tr>
              <tr><td><strong>Empty To:</strong></td><td>${tripRecord.To}</td></tr>
              </tr>
              <tr><td><strong>Start Odometer:</strong></td><td>${tripRecord.startOdometer}</td></tr>
              <tr><td><strong>Finish Odometer:</strong></td><td>${tripRecord.finishOdometer}</td></tr>
              <tr><td><strong>Total Miles:</strong></td><td>${tripRecord.totalMiles}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>Fuel Expenses</h3>
            <table>
              <tr><th>Date</th><th>City</th><th>State</th><th>Gallons</th><th>Cost</th></tr>
              ${fuelEntries
                .map(
                  (entry) => `
                <tr>
                  <td>${entry.date}</td>
                  <td>${entry.city}</td>
                  <td>${entry.state}</td>
                  <td>${entry.gallons}</td>
                  <td>$${entry.cost.toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </table>
            <div class="summary">
              <strong>Total Fuel Cost: $${fuelEntries.reduce((sum, entry) => sum + entry.cost, 0).toFixed(2)}</strong>
            </div>
          </div>

          <div class="section">
            <h3>Miscellaneous Expenses</h3>
            <table>
              <tr><th>Description</th><th>Category</th><th>Amount</th></tr>
              ${miscEntries
                .map(
                  (entry) => `
                <tr>
                  <td>${entry.description}</td>
                  <td>${entry.category}</td>
                  <td>$${entry.amount.toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </table>
            <div class="summary">
              <strong>Total Misc Expenses: $${miscEntries.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2)}</strong>
            </div>
          </div>

          <div class="section">
            <h3>Mileage Log</h3>
            <table>
              <tr><th>State</th><th>Odometer Reading</th><th>Highways Traveled</th><th>Miles Loaded</th><th>Miles Empty</th></tr>
              ${mileageEntries
                .map(
                  (entry) => `
                <tr>
                  <td>${entry.state}</td>
                  <td>${entry.odometerReading}</td>
                  <td>${entry.highwaysTraveled}</td>
                  <td>${entry.milesLoaded}</td>
                  <td>${entry.milesEmpty}</td>
                </tr>
              `,
                )
                .join("")}
            </table>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const createNewReport = () => {
    setTripRecord({
      id: Date.now().toString(),
      loadNumber: "",
      From: "",
      To: "",
      startOdometer: "",
      finishOdometer: "",
      totalMiles: "",
    });
    setFuelEntries([
      {
        id: "1",
        date: "",
        city: "",
        state: "",
        gallons: 0,
        cost: 0,
        image: null,
      },
    ]);
    setMiscEntries([{ id: "1", description: "", amount: 0, category: "" }]);
    setMileageEntries([
      {
        id: "1",
        state: "",
        odometerReading: "",
        highwaysTraveled: "",
        milesLoaded: "",
        milesEmpty: "",
      },
    ]);
  };

  const totalFuelCost = fuelEntries.reduce((sum, entry) => sum + entry.cost, 0);
  const totalMiscCost = miscEntries.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );
  const totalGallons = fuelEntries.reduce(
    (sum, entry) => sum + entry.gallons,
    0,
  );

  return (
    <>
      <Sidebar />
      <div className="ml-64">
        <Header driver={driver} status="on_duty" />

        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Expense Report
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your trip expenses and mileage log
              </p>
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
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Generate PDF</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Trip Record */}
            <div className="xl:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Trip Record</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs">Load Number</Label>
                      <Input
                        value={tripRecord.loadNumber}
                        onChange={(e) =>
                          updateTripRecord("loadNumber", e.target.value)
                        }
                        placeholder="Load number"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Empty From</Label>
                      <Input
                        value={tripRecord.From}
                        onChange={(e) =>
                          updateTripRecord("From", e.target.value)
                        }
                        placeholder="Origin city"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Empty To</Label>
                      <Input
                        value={tripRecord.To}
                        onChange={(e) => updateTripRecord("To", e.target.value)}
                        placeholder="Pickup city"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Start Odometer</Label>
                      <Input
                        type="number"
                        value={tripRecord.startOdometer}
                        onChange={(e) =>
                          updateTripRecord("startOdometer", e.target.value)
                        }
                        placeholder="Starting miles"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Finish Odometer</Label>
                      <Input
                        type="number"
                        value={tripRecord.finishOdometer}
                        onChange={(e) =>
                          updateTripRecord("finishOdometer", e.target.value)
                        }
                        placeholder="Ending miles"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Total Miles</Label>
                      <Input
                        type="number"
                        value={tripRecord.totalMiles}
                        onChange={(e) =>
                          updateTripRecord("totalMiles", e.target.value)
                        }
                        placeholder="Total trip miles"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Expenses */}
            <div className="xl:col-span-2 space-y-6">
              {/* Fuel Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Receipt className="w-5 h-5" />
                      <span>Fuel Expenses</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-sm">
                        {totalGallons.toFixed(2)} gal | $
                        {totalFuelCost.toFixed(2)}
                      </Badge>
                      <Button
                        onClick={addFuelEntry}
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Entry</span>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fuelEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">
                            Fuel Entry #{entry.id}
                          </h4>
                          {fuelEntries.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteFuelEntry(entry.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">Date</Label>
                            <Input
                              type="date"
                              value={entry.date}
                              onChange={(e) =>
                                updateFuelEntry(
                                  entry.id,
                                  "date",
                                  e.target.value,
                                )
                              }
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">City</Label>
                            <Input
                              value={entry.city}
                              onChange={(e) =>
                                updateFuelEntry(
                                  entry.id,
                                  "city",
                                  e.target.value,
                                )
                              }
                              placeholder="City"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">State</Label>
                            <Input
                              value={entry.state}
                              onChange={(e) =>
                                updateFuelEntry(
                                  entry.id,
                                  "state",
                                  e.target.value,
                                )
                              }
                              placeholder="State"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Gallons</Label>
                            <Input
                              type="number"
                              value={entry.gallons || ""}
                              onChange={(e) =>
                                updateFuelEntry(
                                  entry.id,
                                  "gallons",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              placeholder="0"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Cost ($)</Label>
                            <Input
                              type="number"
                              value={entry.cost || ""}
                              onChange={(e) =>
                                updateFuelEntry(
                                  entry.id,
                                  "cost",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              placeholder="0.00"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Receipt Image</Label>
                            <div className="flex space-x-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(entry.id, file);
                                }}
                                className="text-xs"
                              />
                              <Button size="sm" variant="outline">
                                <Camera className="w-4 h-4" />
                              </Button>
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
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Miscellaneous Expenses</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-sm">
                        Total: ${totalMiscCost.toFixed(2)}
                      </Badge>
                      <Button
                        onClick={addMiscEntry}
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Entry</span>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {miscEntries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">
                            Misc Entry #{index + 1}
                          </h4>
                          {miscEntries.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMiscEntry(entry.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              value={entry.description}
                              onChange={(e) =>
                                updateMiscEntry(
                                  entry.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Describe the expense"
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Category</Label>
                            <Select
                              value={entry.category}
                              onValueChange={(value) =>
                                updateMiscEntry(entry.id, "category", value)
                              }
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {EXPENSE_CATEGORIES.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Amount ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={entry.amount || ""}
                              onChange={(e) =>
                                updateMiscEntry(
                                  entry.id,
                                  "amount",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              placeholder="0.00"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mileage Log */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Mileage Log</span>
                    </span>
                    <Button
                      onClick={addMileageEntry}
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Entry</span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mileageEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">
                            Mileage Entry #{entry.id}
                          </h4>
                          {mileageEntries.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMileageEntry(entry.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <div>
                            <Label className="text-xs">State</Label>
                            <Input
                              value={entry.state}
                              onChange={(e) =>
                                updateMileageEntry(
                                  entry.id,
                                  "state",
                                  e.target.value,
                                )
                              }
                              placeholder="State"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Odometer Reading</Label>
                            <Input
                              type="number"
                              value={entry.odometerReading}
                              onChange={(e) =>
                                updateMileageEntry(
                                  entry.id,
                                  "odometerReading",
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Highways Traveled</Label>
                            <Input
                              value={entry.highwaysTraveled}
                              onChange={(e) =>
                                updateMileageEntry(
                                  entry.id,
                                  "highwaysTraveled",
                                  e.target.value,
                                )
                              }
                              placeholder="I-80, I-25"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Miles Loaded</Label>
                            <Input
                              type="number"
                              value={entry.milesLoaded}
                              onChange={(e) =>
                                updateMileageEntry(
                                  entry.id,
                                  "milesLoaded",
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Miles Empty</Label>
                            <Input
                              type="number"
                              value={entry.milesEmpty}
                              onChange={(e) =>
                                updateMileageEntry(
                                  entry.id,
                                  "milesEmpty",
                                  e.target.value,
                                )
                              }
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
      </div>
    </>
  );
}
