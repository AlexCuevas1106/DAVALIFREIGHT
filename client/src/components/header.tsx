import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, ChevronDown } from "lucide-react";
import { getInitials, getStatusColor } from "@/lib/utils";

interface HeaderProps {
  driver: {
    name: string;
    role: string;
  };
  status: string;
}

export function Header({ driver, status }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Online
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600"
          >
            <Bell className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-blue-600 text-white text-sm">
                {getInitials(driver.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{driver.name}</p>
              <p className="text-gray-500 capitalize">{driver.role}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
