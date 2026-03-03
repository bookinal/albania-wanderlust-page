import { useEffect, useState } from "react";
import { apiClient } from "@albania/api-client";

export const useUserRole = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const {
          data: { user },
        } = await apiClient.auth.getUser();
        if (user) {
          setUserId(user.id);
          // Check if user has admin role in metadata
          const role = user.user_metadata?.role;
          setIsAdmin(role === "admin");
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, []);

  return { isAdmin, isLoading, userId };
};
