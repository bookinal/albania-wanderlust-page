import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/api/authService";
import { userService } from "@/services/api/userService";
import { User } from "@/types/user.types";

interface AuthContextType {
  user: User | null;
  userRole: any;
  userStatus: any;
  loading: boolean;
  handleLogout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const currentUser = await userService.getCurrentUser();
      if (!currentUser) {
        setUser(null);
        setUserRole(null);
        setUserStatus(null);
        return;
      }
      setUser(currentUser);
      setUserRole(currentUser.role);
      setUserStatus(currentUser.status);
    } catch {
      setUser(null);
      setUserRole(null);
      setUserStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userStatus === "suspended") {
      handleLogout();
      window.open("/suspended", "_blank");
    }
  }, [userStatus]);

  const handleLogout = async () => {
    await authService.signOut();
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, userRole, userStatus, loading, handleLogout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
