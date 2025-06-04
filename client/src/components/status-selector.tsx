import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Clock, User, Truck, Bed } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusSelectorProps {
  driverId: number;
  currentStatus: string;
}

const statusOptions = [
  {
    value: "off_duty",
    label: "Off Duty",
    icon: User,
    color: "bg-gray-500",
    description: "Not available for driving"
  },
  {
    value: "on_duty",
    label: "On Duty",
    icon: Clock,
    color: "bg-yellow-500",
    description: "Available but not driving"
  },
  {
    value: "driving",
    label: "Driving",
    icon: Truck,
    color: "bg-green-500",
    description: "Currently driving"
  },
  {
    value: "sleeper",
    label: "Sleeper Berth",
    icon: Bed,
    color: "bg-blue-500",
    description: "Rest period in sleeper berth"
  }
];

export function StatusSelector({ driverId, currentStatus }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const updateData = {
        status: newStatus,
        dutyStartTime: newStatus !== "off_duty" ? new Date().toISOString() : null
      };
      
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${driverId}`] });
      toast({
        title: "Status Updated",
        description: "Your duty status has been updated successfully.",
      });
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus);
  const CurrentIcon = currentStatusOption?.icon || User;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-auto p-3 justify-between min-w-[200px]"
          disabled={updateStatusMutation.isPending}
        >
          <div className="flex items-center space-x-3">
            <div className={cn("w-3 h-3 rounded-full", currentStatusOption?.color)} />
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <CurrentIcon className="w-4 h-4" />
                <span className="font-medium">{currentStatusOption?.label}</span>
              </div>
              <p className="text-xs text-gray-500">{currentStatusOption?.description}</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = option.value === currentStatus;
          
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                if (!isSelected) {
                  updateStatusMutation.mutate(option.value);
                }
              }}
              className={cn(
                "p-3 cursor-pointer",
                isSelected && "bg-blue-50"
              )}
              disabled={isSelected}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={cn("w-3 h-3 rounded-full", option.color)} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{option.label}</span>
                    {isSelected && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}