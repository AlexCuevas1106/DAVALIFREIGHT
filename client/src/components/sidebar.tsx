import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Truck,
  BarChart3,
  Users,
  Route,
  Package,
  FileText,
  Plus,
  ClipboardCheck
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Drivers", href: "/drivers", icon: Users },
  { name: "Vehicles", href: "/vehicles", icon: Truck },
  { name: "Routes", href: "/routes", icon: Route },
  { name: "Shipments", href: "/shipments", icon: Package },
  { name: "Reports", href: "/reports", icon: FileText },
];

const quickActions = [
  { name: "New Shipment", href: "/shipments/new", icon: Plus },
  { name: "Inspection", href: "/inspections/new", icon: ClipboardCheck },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-full z-10">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Davali Freight</h1>
            <p className="text-sm text-gray-500">Driver Portal</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </p>
          <div className="space-y-2">
            {quickActions.map((item) => (
              <Link key={item.name} href={item.href}>
                <a className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
