
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Driver } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export function useAuth() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery<Driver>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // Always check for fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  console.log("useAuth - user:", user, "isLoading:", isLoading, "error:", error);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    isAdmin: user?.role === "admin",
    isDriver: user?.role === "driver",
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
