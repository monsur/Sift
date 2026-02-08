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

// Auth response types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  profile: UserProfile;
  tokens: AuthTokens;
}

export interface ProfileResponse {
  user: User;
  profile: UserProfile;
}

// AI types
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AITokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface AIConversationTurnResult {
  message: string;
  is_done: boolean;
  token_usage: AITokenUsage;
}

export interface AISummaryResult {
  refined_entry: string;
  key_moments: string[];
  tldr: string;
  ai_suggested_score: number;
  score_justification: string;
}

export interface AISummaryGenerationResult {
  summary: AISummaryResult;
  token_usage: AITokenUsage;
}

// Dashboard types
export interface UserProfileWithStats extends UserProfile {
  total_entries: number;
  current_streak: number;
  longest_streak: number;
  avg_score_7_day: number | null;
  avg_score_30_day: number | null;
  avg_score_all_time: number | null;
}

export interface ScoreDistributionPoint {
  score: number;
  count: number;
}

export interface DashboardStats {
  total_entries: number;
  current_streak: number;
  longest_streak: number;
  avg_score_7_day: number | null;
  avg_score_30_day: number | null;
  avg_score_all_time: number | null;
  score_distribution: ScoreDistributionPoint[];
  score_trend: 'up' | 'down' | 'stable' | 'insufficient_data';
  last_entry_date: string | null;
}

export interface TimelineDataPoint {
  entry_date: string;
  score: number;
  entry_id: string;
}

export interface DashboardTimeline {
  data_points: TimelineDataPoint[];
  period: string;
}
