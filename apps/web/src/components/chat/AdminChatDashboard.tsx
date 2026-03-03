import React, { useState, useEffect } from "react";
import { chatService } from "@albania/api-client";
import {
  ConversationWithUnreadCount,
  ChatMessage,
  MessageRole,
} from "@albania/shared-types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageCircle, CheckCircle, XCircle } from "lucide-react";
import { apiClient } from "@albania/api-client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AdminChatDashboard: React.FC = () => {
  const [conversations, setConversations] = useState<
    ConversationWithUnreadCount[]
  >([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithUnreadCount | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const { toast } = useToast();

  // Realtime channels
  const [conversationsChannel, setConversationsChannel] =
    useState<RealtimeChannel | null>(null);
  const [messagesChannel, setMessagesChannel] =
    useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await apiClient.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        loadConversations();
        subscribeToAllConversations();
      }
    };
    getCurrentUser();

    return () => {
      if (conversationsChannel) {
        chatService.unsubscribe(conversationsChannel);
      }
      if (messagesChannel) {
        chatService.unsubscribe(messagesChannel);
      }
    };
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const convs = await chatService.getAllConversationsForAdmin();
      setConversations(convs);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToAllConversations = () => {
    const channel = chatService.subscribeToAllConversations(
      (newConv) => {
        setConversations((prev) => [newConv as any, ...prev]);
      },
      (updatedConv) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === updatedConv.id ? { ...c, ...updatedConv } : c,
          ),
        );
      },
    );
    setConversationsChannel(channel);

    // Subscribe to all messages to update unread counts
    const msgChannel = chatService.subscribeToAllMessages((newMessage) => {
      // Update the conversation's unread count if it's from a user
      if (newMessage.role === "user") {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === newMessage.conversation_id
              ? {
                  ...c,
                  unread_count: c.unread_count + 1,
                  last_message: newMessage.message,
                  last_message_at: newMessage.created_at,
                }
              : c,
          ),
        );
      } else {
        // Update last_message for admin messages too
        setConversations((prev) =>
          prev.map((c) =>
            c.id === newMessage.conversation_id
              ? {
                  ...c,
                  last_message: newMessage.message,
                  last_message_at: newMessage.created_at,
                }
              : c,
          ),
        );
      }

      // If the message is for the selected conversation, add it to messages
      if (selectedConversation?.id === newMessage.conversation_id) {
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });

        // Auto-mark as read if it's from the user
        if (newMessage.user_id !== currentUserId) {
          chatService.markMessageAsRead(newMessage.id);
        }
      }
    });
    setMessagesChannel(msgChannel);
  };

  const handleSelectConversation = async (
    conv: ConversationWithUnreadCount,
  ) => {
    setSelectedConversation(conv);
    try {
      const msgs = await chatService.getMessages(conv.id);
      setMessages(msgs);

      // Mark messages as read
      await chatService.markConversationMessagesAsRead(conv.id);

      // Update unread count in list
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c)),
      );
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedConversation) return;

    try {
      const sentMessage = await chatService.sendMessage({
        conversation_id: selectedConversation.id,
        message,
        role: "admin" as MessageRole,
      });

      // The message will be added via real-time subscription,
      // but we can update the conversation list immediately
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                last_message: message,
                last_message_at: sentMessage.created_at,
              }
            : c,
        ),
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedConversation) return;

    try {
      await chatService.updateConversation(selectedConversation.id, {
        status: status as any,
      });
      setSelectedConversation({
        ...selectedConversation,
        status: status as any,
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, status: status as any }
            : c,
        ),
      );
      toast({
        title: "Success",
        description: `Conversation marked as ${status}`,
      });
    } catch (error) {
      console.error("Error updating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to update conversation status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      case "resolved":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Conversations List */}
      <Card className="w-96 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Support Conversations
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {conversations.length} total conversations
          </p>
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 p-4">
              <p className="text-center">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    selectedConversation?.id === conv.id
                      ? "bg-gray-100 dark:bg-gray-800"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {conv.user_email || "User"}
                      </span>
                      <Badge
                        className={`${getStatusColor(conv.status)} text-white text-xs`}
                      >
                        {conv.status}
                      </Badge>
                    </div>
                    {conv.unread_count > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {conv.last_message || "No messages yet"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(conv.last_message_at), "MMM d, p")}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Chat View */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {selectedConversation.user_email || "User"}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedConversation.title || "Support Conversation"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedConversation.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Messages */}
            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              isLoading={false}
            />

            {/* Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              placeholder="Type your response..."
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
