// Score constants
export const SCORE_MIN = 1;
export const SCORE_MAX = 10;

export const SCORE_LABELS: Record<number, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Below Average',
  4: 'Slightly Below Average',
  5: 'Average',
  6: 'Slightly Above Average',
  7: 'Above Average',
  8: 'Good',
  9: 'Great',
  10: 'Excellent',
};

// Entry constraints
export const MAX_ENTRY_LENGTH = 10000;
export const MAX_SCORE_JUSTIFICATION_LENGTH = 500;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Auth constants
export const PASSWORD_MIN_LENGTH = 12;
export const MAX_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCK_DURATION_MINUTES = 15;
export const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;

// Rate limiting
export const RATE_LIMIT_LOGIN_ATTEMPTS = 5;
export const RATE_LIMIT_LOGIN_WINDOW_MINUTES = 15;
export const RATE_LIMIT_VERIFICATION_EMAILS = 3;
export const RATE_LIMIT_VERIFICATION_WINDOW_HOURS = 1;
export const RATE_LIMIT_PASSWORD_RESET = 3;
export const RATE_LIMIT_PASSWORD_RESET_WINDOW_HOURS = 1;

// AI constants
export const AI_MODEL = 'claude-sonnet-4-20250514';
export const MAX_CONVERSATION_TURNS = 5;
export const CONTEXT_DAYS = 14;

// AI provider constants
export const AI_PROVIDERS = ['anthropic', 'openai', 'gemini'] as const;
export type AIProviderName = (typeof AI_PROVIDERS)[number];
export const DEFAULT_AI_PROVIDER: AIProviderName = 'anthropic';
export const CONVERSATION_TEMPERATURE = 0.7;
export const SUMMARY_TEMPERATURE = 1.0;
export const CONVERSATION_MAX_TOKENS = 1024;
export const SUMMARY_MAX_TOKENS = 2048;

// Crisis detection keywords (simple keyword matching for MVP)
export const CRISIS_KEYWORDS = [
  'kill myself',
  'end my life',
  'want to die',
  'suicide',
  'suicidal',
  'self-harm',
  'self harm',
  'hurt myself',
  'don\'t want to be alive',
  "don't want to be alive",
  'no reason to live',
  'better off dead',
  'can\'t go on',
  "can't go on",
  'end it all',
] as const;

export const CRISIS_RESOURCES = [
  {
    name: '988 Suicide & Crisis Lifeline',
    contact: 'Call or text: 988',
    details: 'Available 24/7, free and confidential support',
  },
  {
    name: 'Crisis Text Line',
    contact: 'Text: HOME to 741741',
    details: '24/7 text-based crisis support',
  },
  {
    name: 'Emergency Services',
    contact: 'Call: 911',
    details: 'For immediate emergency assistance or visit your nearest emergency room',
  },
] as const;
