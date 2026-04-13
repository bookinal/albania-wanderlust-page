import { useAuth } from "@/context/AuthContext";

export const useUserRole = () => {
  const { user, userRole, loading } = useAuth();

  const isAdmin = userRole?.role === "admin" || userRole === "admin";
  const userId = user?.id || null;

  return { isAdmin, isLoading: loading, userId };
};
