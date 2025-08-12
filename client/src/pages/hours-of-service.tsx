import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function HoursOfService() {
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hours of Service</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your driving hours and compliance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Drive Time Remaining:</span>
                  <span className="font-bold text-green-600">8.7 hrs</span>
                </div>
                <div className="flex justify-between">
                  <span>Duty Time Remaining:</span>
                  <span className="font-bold text-blue-600">8.5 hrs</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Status:</span>
                  <span className="font-bold capitalize">{user?.status?.replace('_', ' ') || 'Off Duty'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Today's Log</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400">Hours of Service logging functionality coming soon.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}