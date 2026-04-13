import React, { useState, useEffect } from "react";
import { chatService } from "@albania/api-client";
import {
  ConversationWithUnreadCount,
  ChatMessage,
  MessageRole,
} from "@albania/shared-types";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageCircle } from "lucide-react";
import { apiClient } from "@albania/api-client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useTheme } from "@/context/ThemeContext";

export const AdminChatDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [conversations, setConversations] = useState<ConversationWithUnreadCount[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithUnreadCount | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const { toast } = useToast();

  const [conversationsChannel, setConversationsChannel] = useState<RealtimeChannel | null>(null);
  const [messagesChannel, setMessagesChannel] = useState<RealtimeChannel | null>(null);

  const tk = {
    pageBg: isDark ? "transparent" : "transparent",
    panelBg: isDark ? "#111115" : "#ffffff",
    panelBorder: isDark ? "rgba(255,255,255,0.07)" : "#e5e2de",
    panelShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(15,23,42,0.08)",
    headerBorder: isDark ? "rgba(255,255,255,0.06)" : "#e5e2de",
    headingText: isDark ? "#ffffff" : "#111115",
    mutedText: isDark ? "rgba(255,255,255,0.45)" : "#6b6663",
    divider: isDark ? "rgba(255,255,255,0.05)" : "#e5e2de",
    rowBg: isDark ? "transparent" : "transparent",
    rowSelectedBg: isDark ? "rgba(232,25,44,0.08)" : "#fff1f2",
    rowHoverBg: isDark ? "rgba(255,255,255,0.04)" : "#f5f2ee",
    senderText: isDark ? "#ffffff" : "#111115",
    previewText: isDark ? "rgba(255,255,255,0.50)" : "#6b6663",
    timeText: isDark ? "rgba(255,255,255,0.30)" : "#9e9994",
    badgeUnread: "#E8192C",
    selectBg: isDark ? "rgba(255,255,255,0.05)" : "#f5f2ee",
    selectBorder: isDark ? "rgba(255,255,255,0.12)" : "#ddd9d5",
    selectText: isDark ? "#ffffff" : "#111115",
    emptyIcon: isDark ? "rgba(255,255,255,0.20)" : "#9e9994",
    emptyText: isDark ? "rgba(255,255,255,0.45)" : "#6b6663",
    loaderColor: "#E8192C",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "#16a34a";
      case "closed": return "#6b7280";
      case "resolved": return "#E8192C";
      default: return "#6b7280";
    }
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await apiClient.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        loadConversations();
        subscribeToAllConversations();
      }
    };
    getCurrentUser();

    return () => {
      if (conversationsChannel) chatService.unsubscribe(conversationsChannel);
      if (messagesChannel) chatService.unsubscribe(messagesChannel);
    };
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const convs = await chatService.getAllConversationsForAdmin();
      setConversations(convs);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast({ title: "Error", description: "Failed to load conversations", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToAllConversations = () => {
    const channel = chatService.subscribeToAllConversations(
      (newConv) => { setConversations((prev) => [newConv as any, ...prev]); },
      (updatedConv) => {
        setConversations((prev) =>
          prev.map((c) => c.id === updatedConv.id ? { ...c, ...updatedConv } : c),
        );
      },
    );
    setConversationsChannel(channel);

    const msgChannel = chatService.subscribeToAllMessages((newMessage) => {
      if (newMessage.role === "user") {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === newMessage.conversation_id
              ? { ...c, unread_count: c.unread_count + 1, last_message: newMessage.message, last_message_at: newMessage.created_at }
              : c,
          ),
        );
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === newMessage.conversation_id
              ? { ...c, last_message: newMessage.message, last_message_at: newMessage.created_at }
              : c,
          ),
        );
      }

      if (selectedConversation?.id === newMessage.conversation_id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        if (newMessage.user_id !== currentUserId) {
          chatService.markMessageAsRead(newMessage.id);
        }
      }
    });
    setMessagesChannel(msgChannel);
  };

  const handleSelectConversation = async (conv: ConversationWithUnreadCount) => {
    setSelectedConversation(conv);
    try {
      const msgs = await chatService.getMessages(conv.id);
      setMessages(msgs);
      await chatService.markConversationMessagesAsRead(conv.id);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c)),
      );
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({ title: "Error", description: "Failed to load messages", variant: "destructive" });
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
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, last_message: message, last_message_at: sentMessage.created_at }
            : c,
        ),
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedConversation) return;
    try {
      await chatService.updateConversation(selectedConversation.id, { status: status as any });
      setSelectedConversation({ ...selectedConversation, status: status as any });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id ? { ...c, status: status as any } : c,
        ),
      );
      toast({ title: "Success", description: `Conversation marked as ${status}` });
    } catch (error) {
      console.error("Error updating conversation:", error);
      toast({ title: "Error", description: "Failed to update conversation status", variant: "destructive" });
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 4rem)", gap: "16px", padding: "16px" }}>
      {/* Conversations List Panel */}
      <div
        style={{
          width: "384px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: tk.panelBg,
          border: `1px solid ${tk.panelBorder}`,
          borderRadius: "12px",
          boxShadow: tk.panelShadow,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px", borderBottom: `1px solid ${tk.headerBorder}` }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: tk.headingText, display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <MessageCircle style={{ width: "20px", height: "20px", color: "#E8192C" }} />
            Support Conversations
          </h2>
          <p style={{ fontSize: "13px", color: tk.mutedText, marginTop: "4px" }}>
            {conversations.length} total conversations
          </p>
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
              <Loader2 style={{ width: "32px", height: "32px", color: tk.loaderColor, animation: "spin 1s linear infinite" }} />
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px", color: tk.emptyText }}>
              <p style={{ textAlign: "center" }}>No conversations yet</p>
            </div>
          ) : (
            <div>
              {conversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    style={{
                      width: "100%",
                      padding: "16px",
                      textAlign: "left",
                      background: isSelected ? tk.rowSelectedBg : tk.rowBg,
                      border: "none",
                      borderBottom: `1px solid ${tk.divider}`,
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = tk.rowHoverBg; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = tk.rowBg; }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 600, fontSize: "13px", color: tk.senderText }}>
                          {conv.user_email || "User"}
                        </span>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "white",
                            background: getStatusColor(conv.status),
                          }}
                        >
                          {conv.status}
                        </span>
                      </div>
                      {conv.unread_count > 0 && (
                        <span
                          style={{
                            background: tk.badgeUnread,
                            color: "white",
                            borderRadius: "20px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            fontWeight: 700,
                            marginLeft: "auto",
                          }}
                        >
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "13px", color: tk.previewText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {conv.last_message || "No messages yet"}
                    </p>
                    <p style={{ fontSize: "11px", color: tk.timeText, marginTop: "4px" }}>
                      {format(new Date(conv.last_message_at), "MMM d, p")}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat View Panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: tk.panelBg,
          border: `1px solid ${tk.panelBorder}`,
          borderRadius: "12px",
          boxShadow: tk.panelShadow,
          overflow: "hidden",
        }}
      >
        {selectedConversation ? (
          <>
            {/* Header */}
            <div style={{ padding: "16px", borderBottom: `1px solid ${tk.headerBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontWeight: 600, color: tk.headingText, fontSize: "15px", margin: 0 }}>
                  {selectedConversation.user_email || "User"}
                </h3>
                <p style={{ fontSize: "13px", color: tk.mutedText, marginTop: "2px" }}>
                  {selectedConversation.title || "Support Conversation"}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <select
                  value={selectedConversation.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    background: tk.selectBg,
                    border: `1px solid ${tk.selectBorder}`,
                    borderRadius: "8px",
                    color: tk.selectText,
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: tk.emptyText }}>
            <div style={{ textAlign: "center" }}>
              <MessageCircle style={{ width: "48px", height: "48px", margin: "0 auto 16px", color: tk.emptyIcon }} />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
