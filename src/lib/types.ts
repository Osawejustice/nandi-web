// Types derived from nandi-api handlers/DTOs. Backend is the source of truth.

export type Role = 'owner' | 'admin' | 'agent';
export type AgentStatus = 'online' | 'busy' | 'offline';
export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type Channel = 'sms' | 'whatsapp';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'received';
export type CampaignStatus =
  | 'draft'
  | 'queued'
  | 'sending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  role: Role | string;
  agent_status: AgentStatus | string;
  created_at: string;
}

export interface TenantChoice {
  id: string;
  name: string;
  slug: string;
}

export interface AuthData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  tenant: Tenant;
  user: User;
}

export interface MeData {
  auth_type: string;
  role: string;
  tenant: Tenant;
  user: User | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenant_slug?: string;
}

export interface RegisterRequest {
  organization: string;
  name: string;
  email: string;
  password: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface Contact {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ContactInput {
  name: string;
  phone: string;
  email?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  contact_id: string;
  assignee_id: string | null;
  status: ConversationStatus | string;
  channel: Channel | string;
  last_message_at: string | null;
  last_message_preview: string;
  unread_count: number;
  sentiment_score: number | null;
  sentiment_label: string;
  summary?: string;
  contact?: Contact | null;
  assignee?: User | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  contact_id: string;
  sender_id?: string | null;
  direction: MessageDirection | string;
  channel: Channel | string;
  body: string;
  status: string;
  provider?: string;
  provider_message_id?: string;
  sentiment_score: number | null;
  sentiment_label: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: Message[];
}

export interface PatchConversationRequest {
  status?: string;
  assignee_id?: string;
}

export interface Campaign {
  id: string;
  tenant_id: string;
  created_by: string;
  name: string;
  channel: Channel | string;
  message_template: string;
  status: CampaignStatus | string;
  audience_filter: Record<string, unknown>;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  total_count: number;
  sent_count: number;
  failed_count: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignRequest {
  name: string;
  channel?: string;
  message_template: string;
  tag?: string;
  scheduled_at?: string | null;
}

export interface AgentMetric {
  user_id: string;
  replies: number;
}

export interface AnalyticsOverview {
  conversations_by_status: Record<string, number>;
  conversations_by_channel: Record<string, number>;
  messages_last_7_days: number;
  messages_last_30_days: number;
  agent_replies_last_7_days: AgentMetric[];
}

export interface TenantSettings {
  id?: string;
  tenant_id?: string;
  feature_flags: Record<string, unknown>;
  preferences: Record<string, unknown>;
  providers?: Record<string, string[]>;
  secrets_note?: string;
}

export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  role: string;
  last_used_at: string | null;
  created_at: string;
}

export interface APIKeyCreated extends APIKey {
  key: string;
}

export interface PageMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    request_id?: string;
    details?: Record<string, string>;
    tenants?: TenantChoice[];
  };
}

/** @deprecated Use Page<T> — kept so existing imports compile during migration. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}
