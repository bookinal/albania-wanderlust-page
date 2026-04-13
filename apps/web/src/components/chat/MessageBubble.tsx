import React from "react";
import { ChatMessage } from "@albania/shared-types";
import { format } from "date-fns";
import { useTheme } from "@/context/ThemeContext";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showAvatar?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar = true,
}) => {
  const { isDark } = useTheme();
  const isAdmin = message.role === "admin";
  const formattedTime = format(new Date(message.created_at), "p");

  const tk = {
    ownBubbleBg: "#E8192C",
    ownBubbleText: "#ffffff",
    otherBubbleBg: isDark ? "rgba(255,255,255,0.08)" : "#f0ece8",
    otherBubbleText: isDark ? "#ffffff" : "#111115",
    timeText: isDark ? "rgba(255,255,255,0.35)" : "#9e9994",
    adminAvatarBg: "#E8192C",
    userAvatarBg: isDark ? "rgba(255,255,255,0.12)" : "#d1cdc9",
    avatarText: "#ffffff",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginBottom: "16px",
        flexDirection: isOwnMessage ? "row-reverse" : "row",
      }}
    >
      {showAvatar && (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: isAdmin ? tk.adminAvatarBg : tk.userAvatarBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 700,
            color: tk.avatarText,
            flexShrink: 0,
          }}
        >
          {isAdmin ? "A" : "U"}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "70%",
          alignItems: isOwnMessage ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            borderRadius: "12px",
            padding: "8px 16px",
            wordBreak: "break-word",
            background: isOwnMessage ? tk.ownBubbleBg : tk.otherBubbleBg,
            color: isOwnMessage ? tk.ownBubbleText : tk.otherBubbleText,
          }}
        >
          <p style={{ fontSize: "14px", whiteSpace: "pre-wrap", margin: 0 }}>
            {message.message}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", padding: "0 8px" }}>
          <span style={{ fontSize: "11px", color: tk.timeText }}>{formattedTime}</span>
          {isOwnMessage && (
            <span style={{ fontSize: "11px", color: tk.timeText }}>
              {message.is_read ? "Read" : "Sent"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
