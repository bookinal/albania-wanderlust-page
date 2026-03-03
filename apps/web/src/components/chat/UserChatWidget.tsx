import React, { useState, useEffect } from "react";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { chatService } from "@albania/api-client";
import {
  ChatConversation,
  ChatMessage,
  MessageRole,
} from "@albania/shared-types";
import { apiClient } from "@albania/api-client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/api/userService";

export const UserChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Realtime channel
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        if (!currentUser) {
          console.log("user not found");
          return;
        }
        setCurrentUserId(currentUser.id);
        const role = currentUser.role;
        setIsAdmin(role === "admin");
        if (role !== "admin") {
          await loadConversation(currentUser.id);
        }
      } catch {
        setCurrentUserId("");
      }
    };
    fetchUser();
    return () => {
      if (channel) {
        chatService.unsubscribe(channel);
      }
    };
  }, []);

  const loadConversation = async (userId: string) => {
    try {
      setIsLoading(true);
      const conversations = await chatService.getUserConversations(userId);
      if (conversations.length > 0) {
        const conv = conversations[0];
        setConversation(conv);
        await loadMessages(conv.id);
        subscribeToMessages(conv.id);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await chatService.getMessages(conversationId);
      setMessages(msgs);

      // Calculate unread count (admin messages that are unread)
      const unread = msgs.filter(
        (m) => m.role === "admin" && !m.is_read,
      ).length;
      setUnreadCount(unread);

      // Mark messages as read when opened
      if (isOpen) {
        await chatService.markConversationMessagesAsRead(conversationId);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const newChannel = chatService.subscribeToConversationMessages(
      conversationId,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);

        // If it's an admin message and chat is not open, increment unread
        if (newMessage.role === "admin" && !isOpen) {
          setUnreadCount((prev) => prev + 1);
        } else if (isOpen) {
          // Mark as read immediately if chat is open
          chatService.markMessageAsRead(newMessage.id);
        }
      },
      (updatedMessage) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)),
        );
      },
    );
    setChannel(newChannel);
  };

  const handleSendMessage = async (message: string) => {
    if (!currentUserId) return;

    try {
      let convId = conversation?.id;

      // Create conversation if it doesn't exist
      if (!convId) {
        const newConv = await chatService.createConversation({
          title: "Support Request",
        });
        setConversation(newConv);
        convId = newConv.id;
        subscribeToMessages(convId);
      }

      await chatService.sendMessage({
        conversation_id: convId,
        message,
        role: "user" as MessageRole,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    setIsMinimized(false);

    // Mark messages as read when opening
    if (conversation?.id) {
      await chatService.markConversationMessagesAsRead(conversation.id);
      setUnreadCount(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Don't render for admin users
  if (isAdmin) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card
          className={`fixed bottom-6 right-6 w-96 shadow-2xl z-50 flex flex-col transition-all ${
            isMinimized ? "h-14" : "h-[600px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">Support Chat</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMinimize}
                className="h-8 w-8"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <MessageList
                messages={messages}
                currentUserId={currentUserId}
                isLoading={isLoading}
              />

              {/* Input */}
              <MessageInput
                onSendMessage={handleSendMessage}
                placeholder={
                  currentUserId
                    ? "Type your message..."
                    : "Please log in to send messages"
                }
                disabled={!currentUserId}
              />
            </>
          )}
        </Card>
      )}
    </>
  );
};
