import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Truck,
  BarChart3,
  Users,
  Route,
  Package,
  FileText,
  Plus,
  ClipboardCheck,
  Menu,
  X
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Drivers", href: "/drivers", icon: Users },
  { name: "Vehicles", href: "/vehicles", icon: Truck },
  { name: "Routes", href: "/routes", icon: Route },
  { name: "Shipments", href: "/shipments", icon: Package },
  { name: "Expenses Report", href: "/expenses-report", icon: FileText },
];

const quickActions = [
  { name: "New Shipment", href: "/shipments/new", icon: Plus },
  { name: "Inspection", href: "/inspections/new", icon: ClipboardCheck },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Update document class to control main content margin
  useEffect(() => {
    if (isCollapsed) {
      document.documentElement.classList.add('sidebar-collapsed');
    } else {
      document.documentElement.classList.remove('sidebar-collapsed');
    }
  }, [isCollapsed]);

  return (
    <aside className={cn(
      "bg-white shadow-lg border-r border-gray-200 fixed h-full z-10 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "border-b border-gray-200 transition-all duration-300",
        isCollapsed ? "p-3" : "p-6"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Davali Freight</h1>
                <p className="text-sm text-gray-500">Driver Portal</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <nav className={cn("mt-6 transition-all duration-300", isCollapsed ? "px-2" : "px-3")}>
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const NavItem = (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center rounded-lg transition-colors cursor-pointer",
                    isCollapsed ? "px-2 py-2 justify-center" : "px-3 py-2",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    {NavItem}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return NavItem;
          })}
        </div>

        {!isCollapsed && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Quick Actions
            </p>
            <div className="space-y-2">
              {quickActions.map((item) => (
                <Link key={item.name} href={item.href}>
                  <div className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-2">
              {quickActions.map((item) => (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <div className="flex items-center px-2 py-2 justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                        <item.icon className="w-5 h-5" />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}