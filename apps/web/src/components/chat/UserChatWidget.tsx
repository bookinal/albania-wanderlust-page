import React, { useState, useEffect } from "react";
import { MessageCircle, X, Minimize2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageList } from "./MessageList";
import { MessageInput, MessageInputPrefill } from "./MessageInput";
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
import { useTheme } from "@/context/ThemeContext";
import { useChatSuggestion } from "@/context/ChatSuggestionContext";
import { getChatThemeTokens } from "./chatTheme";
import { useTranslation } from "react-i18next";

export const UserChatWidget: React.FC = () => {
  const { t } = useTranslation();
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
  const { isDark, isBlue } = useTheme();
  const tk = getChatThemeTokens({ isDark, isBlue });
  const { suggestion } = useChatSuggestion();
  const [prefill, setPrefill] = useState<MessageInputPrefill | null>(null);

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
        title: t("common.error"),
        description: t("chat.failedToLoadConversation", "Failed to load conversation"),
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
          title: suggestion
            ? t("chat.questionAboutTitle", "Question about {{title}}", {
                title: suggestion.title,
              })
            : t("chat.supportRequest", "Support Request"),
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
        title: t("common.error"),
        description: t("chat.failedToSendMessage", "Failed to send message"),
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

  const handleUseSuggestion = () => {
    if (!suggestion) return;
    setPrefill({
      text: t(
        "chat.suggestionPrefillText",
        "Hi, I have a question about this car: {{title}}\n{{url}}",
        { title: suggestion.title, url: suggestion.url },
      ),
      token: Date.now(),
    });
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
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full z-50"
          size="icon"
          style={{
            background: tk.fabBg,
            color: tk.fabIcon,
            boxShadow: tk.fabShadow,
            border: "none",
          }}
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0"
              style={{
                background: tk.unreadBadgeBg,
                color: tk.unreadBadgeText,
                border: "none",
              }}
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card
          className={`fixed bottom-6 right-6 w-96 z-50 flex flex-col transition-all ${
            isMinimized ? "h-14" : "h-[600px]"
          }`}
          style={{
            background: tk.panelBg,
            borderColor: tk.panelBorder,
            boxShadow: tk.panelShadow,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4"
            style={{ background: tk.headerBg, borderBottom: `1px solid ${tk.headerBorder}` }}
          >
            <div className="flex items-center gap-2" style={{ color: tk.headerText }}>
              <MessageCircle className="h-5 w-5" style={{ color: tk.brand }} />
              <h3 className="font-semibold">{t("chat.supportChat", "Support Chat")}</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMinimize}
                className="h-8 w-8"
                style={{ color: tk.headerIconText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = tk.headerIconBtnHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
                style={{ color: tk.headerIconText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = tk.headerIconBtnHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contextual Suggestion */}
          {!isMinimized && suggestion && !isLoading && (
            <div
              style={{
                margin: "12px 16px 0",
                padding: "10px 12px",
                borderRadius: "10px",
                background: tk.otherBubbleBg,
                border: `1px solid ${tk.panelBorder}`,
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <Sparkles className="h-4 w-4" style={{ color: tk.brand, flexShrink: 0, marginTop: "2px" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "13px", color: tk.otherBubbleText }}>
                  {t("chat.askAboutPrefix", "Ask about")}{" "}
                  <strong>{suggestion.title}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleUseSuggestion}
                  style={{
                    marginTop: "6px",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    border: "none",
                    background: tk.brand,
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("chat.askAboutThisCar", "Ask about this car")}
                </button>
              </div>
            </div>
          )}

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
                    ? t("chat.typeYourMessage", "Type your message...")
                    : t("chat.pleaseLogInToSendMessages", "Please log in to send messages")
                }
                disabled={!currentUserId}
                prefill={prefill}
              />
            </>
          )}
        </Card>
      )}
    </>
  );
};
