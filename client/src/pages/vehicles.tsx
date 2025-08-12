import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, ArrowLeft, Fuel, Wrench } from "lucide-react";
import { Link } from "wouter";

export default function Vehicles() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 lg:p-6">
        <div className="flex items-center mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Monitor and manage your assigned vehicles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Current Vehicle #25
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Make & Model</div>
                    <div className="font-semibold">Peterbilt 579</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Year</div>
                    <div className="font-semibold">2022</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Mileage</div>
                    <div className="font-semibold">125,000 mi</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                    <div className="font-semibold text-green-600">In Use</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Fuel className="w-5 h-5 mr-2" />
                Fuel & Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Fuel Level:</span>
                  <span className="font-bold text-blue-600">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Inspection:</span>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Next Service:</span>
                  <span className="text-sm text-yellow-600">Due in 1,500 mi</span>
                </div>
                <Button className="w-full mt-4">
                  <Wrench className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}