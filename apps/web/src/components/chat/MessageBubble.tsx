import React from "react";
import { ChatMessage } from "@albania/shared-types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

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
  const isAdmin = message.role === "admin";
  const formattedTime = format(new Date(message.created_at), "p");

  return (
    <div
      className={cn(
        "flex gap-2 mb-4",
        isOwnMessage ? "flex-row-reverse" : "flex-row",
      )}
    >
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback
            className={cn(isAdmin ? "bg-blue-500" : "bg-gray-500")}
          >
            {isAdmin ? "A" : "U"}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isOwnMessage ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-lg px-4 py-2 break-words",
            isOwnMessage
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100",
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        </div>
        <div className="flex items-center gap-2 mt-1 px-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formattedTime}
          </span>
          {isOwnMessage && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {message.is_read ? "Read" : "Sent"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
