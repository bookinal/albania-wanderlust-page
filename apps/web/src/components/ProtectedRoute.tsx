import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "@/services/api/authService";
import { Skeleton } from "@/components/ui/skeleton";

const ProtectedRoute = () => {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const userRole = await authService.getCurrentUserRole();
        setRole(userRole);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen p-8 space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (role !== "admin" && role !== "provider") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
