import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, Navigation } from "lucide-react";
import { Link } from "wouter";

export default function Routes() {
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Routes</h1>
            <p className="text-gray-500 dark:text-gray-400">Plan and manage your delivery routes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Current Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Origin</div>
                  <div className="font-semibold">Los Angeles, CA</div>
                </div>
                <div className="flex items-center justify-center py-2">
                  <Navigation className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Destination</div>
                  <div className="font-semibold">Phoenix, AZ</div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Distance:</span>
                    <span>400 miles</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Est. Time:</span>
                    <span>6.5 hours</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Route Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400">Advanced route planning features coming soon.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}