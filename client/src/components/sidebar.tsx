import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { useAuth } from "../hooks/useAuth";
import { 
  Truck,
  BarChart3,
  Users,
  Route,
  Package,
  FileText,
  Folder,
  Menu,
  X,
  ClipboardCheck,
  History,
  User,
  LogOut
} from "lucide-react";

// Navigation options are dynamically defined based on user role

export function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAdmin, logout, isLoggingOut } = useAuth();

  // Navigation for regular users (drivers - limited access)
  const driverNavigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Expenses", href: "/expenses-report", icon: FileText },
    { name: "Documents", href: "/documents", icon: Folder },
    { name: "Routes", href: "/routes", icon: Route },
    { name: "Inspection", href: "/inspection", icon: ClipboardCheck },
    { name: "Inspection History", href: "/inspection-history", icon: History },
  ];

  // Full navigation for administrators
  const adminNavigation = [
    {
      name: "Vehicles",
      href: "/vehicles",
      icon: Truck,
    },
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Documents", href: "/documents", icon: Folder },
    { name: "Expenses", href: "/expenses-report", icon: FileText },
    { name: "Routes", href: "/routes", icon: Route },
    { name: "Inspection", href: "/inspection", icon: ClipboardCheck },
    { name: "Inspection History", href: "/inspection-history", icon: History },
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
      "bg-white border-r border-gray-200 fixed h-full z-20 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64",
      "md:relative md:w-64 md:z-10 md:h-auto md:flex md:flex-col md:border-none"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b border-gray-200 transition-all duration-300 flex-shrink-0",
        isCollapsed ? "p-3" : "p-4"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Davali Freight</h1>
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
          {/* Solo renderiza los items principales */}
          {navigation.map((item) => {
            const isActive = location === item.href;

            if (isCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <div className={cn(
                        "flex items-center justify-center h-10 w-10 rounded-lg transition-all duration-200 mx-auto",
                        isActive
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-zinc-600 hover:bg-blue-50 hover:text-blue-600"
                      )}>
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
              <div key={item.name} className="group">
                <Link href={item.href}>
                  <div className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-zinc-700 hover:bg-blue-50 hover:text-blue-600"
                  )}>
                    <item.icon className={cn("w-5 h-5 mr-3 transition-colors",
                      isActive ? "text-white" : "text-zinc-500 group-hover:text-blue-600")} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </nav>

        {/* User section at bottom */}
        <div className="mt-auto p-4 border-t">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {user?.role === 'admin' ? 'Administrador' : 'Chofer'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                disabled={isLoggingOut}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 bg-blue-100 rounded-full w-fit mx-auto">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{user?.name}</p>
                  <p className="text-xs text-zinc-500">
                    {user?.role === 'admin' ? 'Administrador' : 'Chofer'}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={logout}
                    disabled={isLoggingOut}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Cerrar Sesión</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
    </aside>
  );
}

// Ajustar tipo de navigation item:
type NavigationItem = {
  name: string;
  href: string;
  icon?: any;
};

// Busca la definición del array de items del sidebar, por ejemplo:
interface SidebarItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
}

// Si tienes algo como:
const sidebarItems: SidebarItem[] = [
  // ...items...
];

// En el render:
// {item.submenu && (
//   item.submenu.map((subItem: { name: string; href: string }) => (
//     // ...render subItem...
//   ))
// )}