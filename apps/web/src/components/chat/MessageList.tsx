import React, { useEffect, useRef } from "react";
import { ChatMessage } from "@albania/shared-types";
import { MessageBubble } from "./MessageBubble";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/context/ThemeContext";
import { getChatThemeTokens } from "./chatTheme";
import { useTranslation } from "react-i18next";

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { isDark, isBlue } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const tk = getChatThemeTokens({ isDark, isBlue });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, background: tk.bodyBg }}>
        <Loader2 style={{ width: "32px", height: "32px", color: tk.loaderColor, animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: tk.emptyText, background: tk.bodyBg }}>
        <p>{t("chat.noMessagesYet", "No messages yet. Start the conversation!")}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4 py-2" style={{ background: tk.bodyBg }} ref={scrollAreaRef}>
      <div className="space-y-1">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.user_id === currentUserId}
          />
        ))}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
};
