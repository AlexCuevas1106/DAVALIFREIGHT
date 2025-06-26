import { useQuery } from "@tanstack/react-query";
import type { Driver } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<Driver>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isDriver: user?.role === "driver",
  };
}