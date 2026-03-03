import React from "react";
import { AdminChatDashboard } from "@/components/chat/AdminChatDashboard";
import Hsidebar from "../../components/dashboard/hsidebar";

const SupportChat: React.FC = () => {
  return (
    <Hsidebar>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminChatDashboard />
    </div></Hsidebar>
  );
};

export default SupportChat;
