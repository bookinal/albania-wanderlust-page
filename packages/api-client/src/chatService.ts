import { apiClient } from "./apiClient";
import type {
  ChatConversation,
  ChatMessage,
  CreateConversationInput,
  CreateMessageInput,
  UpdateConversationInput,
  ConversationWithUnreadCount,
} from "@albania/shared-types";
import { RealtimeChannel } from "@supabase/supabase-js";

export const chatService = {
  // Conversations
  async getConversations(): Promise<ChatConversation[]> {
    const { data, error } = await apiClient
      .from("chat_conversations")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getConversationById(id: string): Promise<ChatConversation | null> {
    const { data, error } = await apiClient
      .from("chat_conversations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    const { data, error } = await apiClient
      .from("chat_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllConversationsForAdmin(): Promise<ConversationWithUnreadCount[]> {
    // Get all conversations
    const { data: conversations, error: convError } = await apiClient
      .from("chat_conversations")
      .select(
        `
        *,
        chat_messages (
          message,
          created_at,
          is_read,
          role
        )
      `,
      )
      .order("last_message_at", { ascending: false });

    if (convError) throw convError;

    // Transform the data to include unread count and last message
    const conversationsWithCounts = (conversations || []).map((conv: any) => {
      const messages = conv.chat_messages || [];
      const unreadCount = messages.filter(
        (msg: any) => !msg.is_read && msg.role === "user",
      ).length;
      const lastMessage = messages.length > 0 ? messages[0].message : "";

      return {
        ...conv,
        unread_count: unreadCount,
        last_message: lastMessage,
        chat_messages: undefined, // Remove the nested messages
      };
    });

    // Get user emails
    const userIds = conversationsWithCounts.map((c) => c.user_id);
    const { data: users, error: usersError } = await apiClient
      .from("users")
      .select("id, email")
      .in("id", userIds);

    if (!usersError && users) {
      const userMap = new Map(users.map((u: any) => [u.id, u.email]));
      return conversationsWithCounts.map((conv) => ({
        ...conv,
        user_email: userMap.get(conv.user_id),
      }));
    }

    return conversationsWithCounts;
  },

  async createConversation(
    input: CreateConversationInput,
  ): Promise<ChatConversation> {
    const {
      data: { user },
    } = await apiClient.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await apiClient
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        title: input.title || "Support Request",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateConversation(
    id: string,
    input: UpdateConversationInput,
  ): Promise<ChatConversation> {
    const { data, error } = await apiClient
      .from("chat_conversations")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteConversation(id: string): Promise<void> {
    const { error } = await apiClient
      .from("chat_conversations")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Messages
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await apiClient
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async sendMessage(input: CreateMessageInput): Promise<ChatMessage> {
    const {
      data: { user },
    } = await apiClient.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await apiClient
      .from("chat_messages")
      .insert({
        conversation_id: input.conversation_id,
        user_id: user.id,
        message: input.message,
        role: input.role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markMessageAsRead(messageId: string): Promise<void> {
    const { error } = await apiClient
      .from("chat_messages")
      .update({ is_read: true })
      .eq("id", messageId);

    if (error) throw error;
  },

  async markConversationMessagesAsRead(conversationId: string): Promise<void> {
    const {
      data: { user },
    } = await apiClient.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get user role
    const isAdmin = user.user_metadata?.role === "admin";

    // Mark messages as read based on role
    // Users mark admin messages as read, admins mark user messages as read
    const { error } = await apiClient
      .from("chat_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("role", isAdmin ? "user" : "admin");

    if (error) throw error;
  },

  async getUnreadCount(conversationId: string): Promise<number> {
    const {
      data: { user },
    } = await apiClient.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const isAdmin = user.user_metadata?.role === "admin";

    const { count, error } = await apiClient
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conversationId)
      .eq("is_read", false)
      .eq("role", isAdmin ? "user" : "admin");

    if (error) throw error;
    return count || 0;
  },

  // Realtime subscriptions
  subscribeToConversationMessages(
    conversationId: string,
    onMessage: (message: ChatMessage) => void,
    onUpdate: (message: ChatMessage) => void,
  ): RealtimeChannel {
    const channel = apiClient
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessage(payload.new as ChatMessage);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onUpdate(payload.new as ChatMessage);
        },
      )
      .subscribe();

    return channel;
  },

  subscribeToAllConversations(
    onInsert: (conversation: ChatConversation) => void,
    onUpdate: (conversation: ChatConversation) => void,
  ): RealtimeChannel {
    const channel = apiClient
      .channel("all-conversations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_conversations",
        },
        (payload) => {
          onInsert(payload.new as ChatConversation);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_conversations",
        },
        (payload) => {
          onUpdate(payload.new as ChatConversation);
        },
      )
      .subscribe();

    return channel;
  },

  subscribeToAllMessages(
    onMessage: (message: ChatMessage) => void,
  ): RealtimeChannel {
    const channel = apiClient
      .channel("all-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          onMessage(payload.new as ChatMessage);
        },
      )
      .subscribe();

    return channel;
  },

  unsubscribe(channel: RealtimeChannel): void {
    apiClient.removeChannel(channel);
  },
};
