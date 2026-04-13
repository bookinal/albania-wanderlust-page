import React from "react";
import { AdminChatDashboard } from "@/components/chat/AdminChatDashboard";
import { useTheme } from "@/context/ThemeContext";

const SupportChat: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <div
        className="min-h-screen"
        style={{ background: isDark ? '#0d0d0d' : '#f5f4f1' }}
      >
        <AdminChatDashboard />
      </div>
  );
};

export default SupportChat;
