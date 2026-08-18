// ── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

// ── Organization ────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

// ── Conversations ───────────────────────────────────────────────────────────

export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type Channel = 'whatsapp' | 'sms' | 'voice' | 'telegram' | 'email';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar_url?: string;
}

export interface Conversation {
  id: string;
  contact: Contact;
  status: ConversationStatus;
  channel: Channel;
  last_message?: string;
  last_message_at?: string;
  sentiment?: Sentiment;
  unread_count?: number;
  assigned_to?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  channel: Channel;
  sent_at: string;
  sentiment?: Sentiment;
  sender?: {
    id: string;
    name: string;
  };
}

// ── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

// ── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  calls_today: number;
  open_conversations: number;
  avg_response_time: string;
  active_agents: number;
  total_agents: number;
}
