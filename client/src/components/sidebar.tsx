import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { 
  Truck,
  BarChart3,
  Users,
  Route,
  Package,
  FileText,
  Folder,
  Menu,
  X
} from "lucide-react";

// Navigation options are dynamically defined based on user role

export function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAdmin } = useAuth();

  // Navigation for regular users (drivers - limited access)
  const driverNavigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Expenses", href: "/expenses-report", icon: FileText },
    { name: "Documents", href: "/documents", icon: Folder },
    { name: "Routes", href: "/routes", icon: Route },
  ];

  // Full navigation for administrators
  const adminNavigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Documents", href: "/documents", icon: Folder },
    { name: "Expenses", href: "/expenses-report", icon: FileText },
    { name: "Routes", href: "/routes", icon: Route },
    { name: "Vehicles", href: "/vehicles", icon: Truck },
    { name: "Drivers", href: "/drivers", icon: Users },
    { name: "Shipments", href: "/shipments", icon: Package },
  ];

  // Select navigation based on user role
  const navigation = isAdmin ? adminNavigation : driverNavigation;

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
      "bg-white shadow-xl border-r border-gray-200 fixed h-full z-10 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b border-gray-200 transition-all duration-300 flex-shrink-0",
        isCollapsed ? "p-3" : "p-4"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <Truck className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">Davali Freight</h1>
                <p className="text-xs text-gray-500">Management Portal</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={cn("flex-1 overflow-y-auto", isCollapsed ? "px-2" : "px-3")}>
        <div className="py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;

            if (isCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <div
                        className={cn(
                          "flex items-center justify-center h-10 w-10 rounded-lg transition-all duration-200 mx-auto",
                          isActive
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 mr-3 transition-colors", 
                    isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600")} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info Footer */}
      {!isCollapsed && user && (
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500">
                {isAdmin ? "Administrator" : "Driver"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed User Info */}
      {isCollapsed && user && (
        <div className="flex-shrink-0 border-t border-gray-200 p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto cursor-pointer">
                <span className="text-white text-sm font-medium">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">{isAdmin ? "Administrator" : "Driver"}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </aside>
  );
}