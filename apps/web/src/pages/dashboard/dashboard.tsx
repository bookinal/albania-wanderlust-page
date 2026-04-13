import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authService } from "@/services/api/authService";
import { useTheme } from "@/context/ThemeContext";

const Dashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    authService
      .getCurrentUserRole()
      .then((r) => setRole(r))
      .catch(() => setRole(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return null;

  if (role === "admin") {
    return <Navigate to="/dashboard/bookings/providers" replace />;
  }

  if (role === "provider") {
      return <Navigate to="/dashboard/bookings" replace />;
  }

  return (
    <div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: isDark ? "#ffffff" : "#111827",
            marginBottom: "8px",
          }}
        >
          Dashboard Content Here
        </h1>
        <p style={{ color: isDark ? "rgba(255,255,255,0.50)" : "#6b7280", fontSize: "16px" }}>
          Your main content goes here
        </p>
        {/* Add your dashboard widgets, charts, etc. here */}
      </div>
  );
};

export default Dashboard;
