export type ConversationStatus = "open" | "closed" | "resolved";
export type MessageRole = "user" | "admin";

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string | null;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  message: string;
  role: MessageRole;
  is_read: boolean;
  created_at: string;
}

export interface ConversationWithUnreadCount extends ChatConversation {
  unread_count: number;
  last_message?: string;
  user_email?: string;
}

export interface CreateConversationInput {
  title?: string;
}

export interface CreateMessageInput {
  conversation_id: string;
  message: string;
  role: MessageRole;
}

export interface UpdateMessageInput {
  is_read?: boolean;
}

export interface UpdateConversationInput {
  status?: ConversationStatus;
  title?: string;
}
