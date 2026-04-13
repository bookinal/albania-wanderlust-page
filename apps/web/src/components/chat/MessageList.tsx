import React, { useEffect, useRef } from "react";
import { ChatMessage } from "@albania/shared-types";
import { MessageBubble } from "./MessageBubble";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/context/ThemeContext";

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
  const { isDark } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const tk = {
    emptyText: isDark ? "rgba(255,255,255,0.45)" : "#6b6663",
    loaderColor: "#E8192C",
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
        <Loader2 style={{ width: "32px", height: "32px", color: tk.loaderColor, animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: tk.emptyText }}>
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4 py-2" ref={scrollAreaRef}>
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
