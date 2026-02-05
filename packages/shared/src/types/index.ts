// User types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  email_verified: boolean;
  email_verified_at: string | null;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  default_refine_enabled: boolean;
}

// Entry types
export interface Entry {
  id: string;
  user_id: string;
  entry_date: string;
  raw_entry: string;
  refined_entry: string | null;
  tldr: string | null;
  key_moments: string[] | null;
  score: number | null;
  ai_suggested_score: number | null;
  score_justification: string | null;
  input_method: 'text' | 'voice';
  voice_duration_seconds: number | null;
  conversation_transcript: ConversationMessage[] | null;
  token_count: number | null;
  estimated_cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
