# Product Requirements Document: Daily Reflection Tool

**Version:** 1.0 (MVP)
**Last Updated:** January 31, 2026
**Status:** Draft for Review

---

## 1. Vision & Problem Statement

### 1.1 Problem
Professionals struggle to maintain perspective on their emotional wellbeing. We catastrophize difficult periods and romanticize good ones, making it hard to see patterns or understand what truly affects our mood. Without structured reflection, we lack self-awareness about our emotional health over time.

### 1.2 Vision
A web-based daily reflection tool that combines AI-guided introspection with longitudinal tracking to help professionals develop emotional awareness, identify patterns, and gain perspective on their mental wellbeing.

### 1.3 Purpose
Help users understand their inner feelings and notice trends over time. As humans, we're bad at this - we catastrophize the worst and idealize the best. It's hard to remember whether how we're feeling is consistent over time. This tool lends outside perspective to our feelings.

---

## 2. Target Users

**Primary User:** Tech professionals and white-collar workers who:
- Experience varying stress levels and work-life challenges
- Want to understand their emotional patterns better
- Are comfortable with technology and AI interactions
- May use the tool daily or sporadically depending on their needs

**Initial Launch:** Single user, with architecture to support multiple users via authentication in the future.

**Usage Pattern:** Daily use is ideal for accuracy, but sporadic use is supported.

---

## 3. Core Principles

These principles guide all design and AI behavior decisions:

### 3.1 Guided, Not Asked
The world constantly demands decisions from users. This app should be a refuge from decision fatigue. The AI guides users through reflection without forcing choices. Users shouldn't have to think about the app or make decisions - the AI helps them by making confident choices. Part of the catharsis is offloading decision-making.

**Applications:**
- AI decides when to ask questions vs when to stop
- AI decides when conversation is complete
- AI suggests the score (user can adjust but doesn't have to think from scratch)
- No "Would you like to..." prompts - just do it
- Minimal buttons and options - clear path forward

**Exceptions:** Major control points that matter:
- "Save" vs "Refine" (explicit user intent)
- "Save" button always available (user exit anytime)
- Can edit final summary (final approval)
- Can adjust score (personal calibration)

### 3.2 Balanced Perspective
Humans catastrophize bad days and romanticize good ones. The AI's job is to uncover balance - finding overlooked positives in difficult days and acknowledging real struggles in seemingly good days. Neither minimize nor dramatize.

### 3.3 Context Over Conclusions
Initial feelings can be rash. "Today was terrible" might hide important nuance. Ask questions to uncover context before accepting surface-level judgments. Help users see the fuller picture.

### 3.4 Preserve Authentic Voice
This is the user's reflection, not a clinical report. Keep their casual tone, their word choices, their style. Polish for clarity but don't sanitize their humanity.

### 3.5 Reflection, Not Therapy
This tool helps users understand their feelings and patterns. It is NOT therapy, not treatment, not diagnosis. Stay focused on daily reflection and emotional awareness. Provide perspective, not intervention.

**Important Disclaimers:**
- Tool should emphasize it's for reflection, not therapy
- Include disclaimer and resources for professional help
- AI should avoid diagnosing or treating mental health conditions
- Focus on reflection and pattern recognition, not clinical intervention

---

## 4. Core Features

### 4.1 Daily Entry Flow

#### Input Methods
- Text-based writing (primary)
- Voice input (transcribed to text)

#### Entry Content
User describes:
- How their day went
- Current feelings
- Highs and lows
- Free-form thoughts

#### User Choice: Save or Refine
After writing entry, user has two options:

**"Save" Button:**
- Stores raw entry as-is
- No AI interaction
- Immediate save

**"Refine" Button:**
- Kicks off AI conversation
- AI helps explore and refine the entry
- Leads to polished summary

### 4.2 AI Refinement Conversation (Optional)

**Architecture:** Two separate AI flows with distinct prompts

#### Flow A: Refinement Conversation (Iterative)

**Trigger:** User clicks "Refine"

**AI Judgment:** Evaluates if questions are needed based on:
- Missing context for strong emotions
- Contradictions (negative day with positive elements)
- Vague or brief entries needing elaboration
- Unexplored emotional reflection

**If No Questions Needed:**
- AI responds: "Your summary looks good as is"
- User can proceed to scoring or add more

**If Questions Needed:**
- AI asks one question at a time
- Conversational, warm, friendly tone
- Focus on 3 question types:
  - **Context-seeking**: "What specifically about the meeting made you feel that way?"
  - **Pattern-noticing**: "I notice you said it was terrible, but also mentioned coffee with Sarah. How do those fit together?"
  - **Positive-uncovering**: "Were there any small moments that helped, even a little?"
- Avoid "why" questions (can feel judgmental)
- Avoid meaning-making questions (can lead to false narratives)

**Conversation Style:**
- One question at a time
- Like chatting with a caring friend
- Chat-style UI (similar to Claude, Gemini)
- User can respond naturally
- Usually 2-4 question exchanges
- No hard maximum - should converge naturally

**User Control:**
- **"Save" button always visible** - can exit anytime
- User can say "I'm done" or "that's enough" to wrap up
- AI recognizes these signals and moves to summary

**Historical Context:**
- AI has access to last 7-14 days of entries (rolling window)
- Can reference patterns: "You mentioned deadline stress last week too. Is this related?"
- Code should be modular with clear API for context retrieval (easy to swap implementations later)

**Exit Signal:**
- When AI determines conversation is complete, it outputs: "DONE_ASKING_QUESTIONS"
- Triggers Flow B (Summary Generation)

#### Flow B: Summary Generation (Single Call)

**Trigger:**
- Flow A completes (AI says "DONE_ASKING_QUESTIONS")
- User clicks "Save" mid-conversation
- User skipped "Refine" entirely (edge case)

**Input:**
- Original entry
- Full conversation transcript (if any)
- Recent entries as context (last 7-14 days)

**Output Format:**

```
Narrative:
[2-4 sentences, first-person, preserving user's voice]
Weaves together highs and lows naturally, includes specific details from conversation.

Key moments:
• [Specific moment 1]
• [Specific moment 2]
• [Specific moment 3]
[3-5 bullet points of significant moments, mix of positive and challenging]

TLDR:
[One sentence that captures the day's essence]

Score: [1-10]

Score Explanation:
[1-2 sentences explaining the score, referencing specific elements]
```

**Summary Characteristics:**
- Preserves user's casual voice
- Specific and concrete details
- Balanced (includes both struggles and bright spots)
- Authentic (not over-polished or clinical)

**Data Storage:**
- **Visible to user:** Refined entry (Narrative + Key moments + TLDR)
- **Saved for debugging:** Original raw entry + full chat transcript
- **Access pattern:** Refined version is default, raw data accessible but not prominent

#### AI Configuration Differences

|  | Flow A (Conversation) | Flow B (Summary) |
|---|---|---|
| **Temperature** | Lower (~0.7) - focused questions | Higher (~1.0) - natural writing |
| **Max tokens** | Lower - just asking questions | Higher - generating full summary |
| **Purpose** | Guide exploration | Create polished output |

### 4.3 Scoring System

#### Score Representation
- **1-10 scale** representing overall wellbeing for the day
- **Mandatory** for MVP (every entry must have a score)

#### Score Guidance

```
10 - Exceptional: One of your best days
8-9 - Great: Felt good, things went well
6-7 - Good: Solid day, mostly positive
5 - Neutral: Neither good nor bad
3-4 - Challenging: Struggled but managed
1-2 - Very difficult: One of your harder days
```

#### Scoring Flow

1. AI presents summary + suggested score together
2. AI explains score: "Based on your day, I'd score this around a 5/10 because [brief explanation]"
3. User sees slider (1-10) pre-set to AI's suggestion
4. User can:
   - Accept AI's score (leave slider as-is)
   - Adjust score by dragging slider
   - Optionally add text justification for adjustment
5. Save (summary + score + explanation)

#### Relative vs Absolute Scoring

**Approach: Hybrid Display**
- **Storage:** Absolute score (1-10 as agreed)
- **Display:** Includes relative context where helpful
  - Example: "Score: 7 (above your 30-day average of 5.8)"
- **Calibration Evolution:**
  - First 7-14 days: Only absolute score shown
  - After sufficient data: Show relative context
  - System tracks user's typical range automatically

**Benefits:**
- Simple for MVP (no complex calibration)
- User naturally learns their range over time
- Can compare across users eventually (future feature)
- Provides helpful context without overwhelming

#### Technical Storage
- Score stored as separate field in database for analytics
- AI's score explanation saved with entry
- User's justification (if provided) saved with entry

### 4.4 Crisis Detection

**Purpose:** Detect concerning language and provide appropriate resources

**MVP Approach:**

**Detection Method:**
- Simple keyword/pattern matching in conversation and entries
- Detect: self-harm language, suicidal ideation, severe crisis language

**Response (Option A):**
- Show prominent resource banner immediately
- Allow user to continue if they choose

**Banner Content:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  If you're in crisis, please reach out for support:

🇺🇸 988 Suicide & Crisis Lifeline: Call/text 988
   Available 24/7, free and confidential

🇺🇸 Crisis Text Line: Text HOME to 741741

🚨 Emergency: Call 911 or go to nearest ER

This tool is for reflection, not crisis support.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Continue with entry] [Exit]
```

**Data Handling:**
- Entry still saved regardless of detection
- No special flagging or reporting (privacy-first)

**Post-MVP:** Revisit detection sophistication and flow

### 4.5 Historical View & Insights

#### MVP Dashboard: Single Page View

**Top Section: Current State**
```
Your Wellbeing Overview

Current streak: 5 days logged
Last entry: Yesterday (Score: 7)

[Write Today's Entry]
```

**Middle Section: Trends**
```
Trends

Last 7 days:    Average 6.4  ━━━━●━━ (Range: 4-8)
Last 30 days:   Average 5.8  ━━━●━━━ (Range: 3-9)
All time:       Average 6.1  ━━━●━━━ (Range: 2-9)

[Simple line graph showing score over time]
```

**Bottom Section: Recent Entries**
```
Recent Entries

Jan 30, 2026 • Score: 7
TLDR: Good day with productive work and nice evening walk.
[Read more]

Jan 29, 2026 • Score: 5
TLDR: Neutral day, felt tired but got through meetings.
[Read more]

[View all entries]
```

**MVP Features:**
- Simple averages (7 days, 30 days, all time)
- Score ranges for each period
- Basic line graph of scores over time
- List of recent entries with TLDR
- Click to read full entry (Narrative + Key moments + TLDR + Score)

#### Post-MVP Enhancements
- Day-of-week patterns ("Your scores tend to be higher on Tuesdays")
- Volatility metrics ("Your score volatility has decreased this month")
- Theme/word cloud analysis ("You've mentioned 'work deadline' in 7 entries")
- Comparative views ("This month vs last month")
- Longer-term trend analysis
- Streak tracking and celebrations

### 4.6 Data Management

**Export:**
- Users can export all their data
- Standard format (JSON, CSV)

**Delete:**
- Users can delete individual entries
- Users can delete entire history

**Privacy:**
- Cloud-synced (Supabase)
- Private to each user
- Encrypted storage
- No sharing or comparison features in MVP

---

## 5. Technical Architecture

*Note: For rationale behind major architectural decisions, see the Appendix.*

### 5.1 Architecture Overview

**Architecture Pattern:** Decoupled frontend/backend with separate deployment
- Frontend: Single-page application (SPA)
- Backend: REST API server
- Database: Managed PostgreSQL (Supabase)
- Deployment: Static frontend + Node.js backend

**Project Structure:** Monorepo with pnpm workspaces containing three packages: `frontend` (Vite + React), `backend` (Fastify API), and `shared` (TypeScript types and validation schemas).

*See Section 5.12 for detailed project structure.*

---

### 5.2 Frontend Stack

#### Core Framework
- **Vite 5.x** - Build tool and dev server
  - Fast HMR (Hot Module Replacement)
  - ESM-first, modern tooling
  - Optimized production builds
- **React 18** - UI library
  - Component-based architecture
  - Hooks for state management
  - Concurrent features for better UX
- **TypeScript 5.x** - Type safety
  - Compile-time type checking
  - Better IDE support
  - Self-documenting code

#### Routing
- **React Router v6** - Client-side routing
  - Declarative routing
  - Nested routes for complex layouts
  - URL-based navigation

#### State Management
- **TanStack Query v5** (React Query) - Server state management
  - API call handling (loading, error, success states)
  - Automatic caching and refetching
  - Optimistic updates for chat interface
  - Background sync
- **Zustand 4.x** - Client state management
  - Simple, lightweight state store
  - UI state (modals, forms, in-progress conversations)
  - Minimal boilerplate
  - TypeScript-first design

#### Styling
- **Tailwind CSS v4** - Utility-first CSS framework
  - Rapid UI development
  - Responsive design utilities
  - Consistent design system
- **shadcn/ui** - Component library
  - Built on Radix UI (accessible primitives)
  - Copy-paste components (you own the code)
  - Pre-built chat UI, forms, modals
  - Fully customizable

#### HTTP & Data Fetching
- **Axios** or **Fetch API** - HTTP client
  - Integrated with TanStack Query
  - Interceptors for auth tokens
  - Request/response transformation

---

### 5.3 Backend Stack

#### Core Framework
- **Fastify 4.x** - Node.js web framework
  - Fast (~2x Express performance)
  - First-class TypeScript support
  - Schema-based validation
  - Plugin architecture for modularity
- **TypeScript 5.x** - Type safety
  - End-to-end type safety with frontend
  - Better error catching at compile time

#### Database & ORM
- **Supabase** - Managed PostgreSQL + Auth
  - PostgreSQL 15+
  - Free tier: 500MB database, 2GB bandwidth/month
  - Built-in Row Level Security (RLS)
  - Real-time subscriptions (for future features)
- **Supabase JS Client** - Database operations
  - Type-safe queries
  - Automatic connection pooling
  - PostgreSQL extensions support

#### Authentication
- **Supabase Auth** - JWT-based authentication
  - Email/password for MVP
  - JWT tokens with automatic refresh
  - Row Level Security integration
  - Support for OAuth providers (future)

#### AI Integration
- **Anthropic SDK** (`@anthropic-ai/sdk`) - Official Claude API client
  - **Model:** Claude 3.5 Sonnet
  - **Conversation flow:** Temperature ~0.7 (focused questions)
  - **Summary generation:** Temperature ~1.0 (natural writing)
  - Streaming support for future enhancements
- **API Key Management:**
  - MVP: Single API key (stored in environment variables)
  - Future: User-provided API keys (encrypted storage)

#### Validation
- **Zod 3.x** - Schema validation and type inference
  - Runtime validation for API requests/responses
  - Type-safe (generates TypeScript types)
  - Works on both frontend and backend
  - Shared validation schemas in monorepo

#### Configuration
- **dotenv** - Environment variable management
  - Separate .env files for dev/production
  - Secrets stored securely

---

### 5.4 Shared Code

#### Type Definitions
- **Shared TypeScript types** in `packages/shared/`
  - API request/response types
  - Database schema types
  - Entry, user, analytics types
  - Ensures frontend/backend stay in sync

#### Validation Schemas
- **Shared Zod schemas** in `packages/shared/`
  - Used by both frontend (client-side validation) and backend (server-side validation)
  - Single source of truth for data shapes

---

### 5.5 Development Tools

#### Package Management
- **pnpm 8.x** - Fast, efficient package manager
  - Native workspace support for monorepo
  - Faster installs than npm/yarn
  - Efficient disk usage (content-addressable storage)

#### Code Quality
- **ESLint 8.x** - Linting
  - TypeScript-specific rules
  - React hooks rules
  - Consistent code style
- **Prettier 3.x** - Code formatting
  - Automatic formatting on save
  - Consistent style across team
- **Husky** (optional) - Git hooks
  - Pre-commit linting
  - Pre-push type checking

#### Development Utilities
- **tsx** - TypeScript execution for Node.js
  - Run backend TypeScript directly
  - Fast, no compilation step needed
- **concurrently** - Run multiple npm scripts
  - Start frontend and backend simultaneously
  - Single command for full dev environment
- **nodemon** (optional) - Auto-restart on changes
  - Watch backend files
  - Restart server on code changes

#### API Documentation
- **@fastify/swagger** - OpenAPI/Swagger integration
  - Auto-generated API docs from schemas
  - Interactive API testing
  - Type-safe route definitions

---

### 5.6 Voice Input

**Implementation:**
- **Web Speech API** - Browser-native speech recognition
  - Free, no external service required
  - Works in Chrome, Edge, Safari
  - Real-time transcription
  - Graceful fallback if unsupported

**Flow:**
1. User activates voice recording
2. Web Speech API transcribes speech to text
3. User can edit transcription before proceeding
4. Only text is stored (no audio files)
5. Optional metadata: input method, recording duration

**Storage:**
- Voice is input method only
- All data stored as text
- Metadata: `{ entry_type: 'voice', duration_seconds: 45 }`

---

### 5.7 Database Schema

#### Core Tables

**user_profiles**
```sql
- id (UUID, references auth.users)
- created_at, updated_at, last_login_at
- login_count
- email_verified (BOOLEAN, default false)
- email_verified_at (TIMESTAMPTZ)
- failed_login_attempts (INTEGER, default 0)
- locked_until (TIMESTAMPTZ, null when not locked)
- Settings: default_refine_enabled, theme
- Cached stats: total_entries, current_streak, scoring averages
```

**entries**
```sql
- id, user_id, created_at, updated_at, entry_date
- raw_entry (TEXT), entry_type (text/voice)
- voice_input_metadata (JSONB)
- conversation_transcript (JSONB)
- refined_narrative, key_moments (JSONB), tldr
- Scoring: ai_suggested_score, final_score, user_adjusted_score
- AI metadata: model_used, token_counts, total_cost_usd
```

**analytics_events**
```sql
- id, user_id, session_id, created_at
- event_type, event_category, event_data (JSONB)
- Context: user_agent, page_path
```

**analytics_daily_summary**
```sql
- user_id, date
- Aggregated stats: entries_created, avg_conversation_length
- Costs: total_ai_cost_usd
```

**Key Design Decisions:**
- No UNIQUE constraint on (user_id, entry_date) - handled in application layer
- Full conversation transcript stored for debugging
- Cost tracking per entry for budget monitoring
- Row Level Security (RLS) enabled on all tables

---

### 5.8 Deployment & Hosting

#### Frontend Hosting
- **Vercel** (primary choice)
  - Free tier: 100GB bandwidth/month
  - Automatic GitHub integration
  - Preview deployments for PRs
  - Global CDN
  - Alternative: Netlify (similar features)

#### Backend Hosting
- **Railway** (primary choice)
  - Free tier: $5 credit/month
  - Node.js support
  - Easy GitHub integration
  - PostgreSQL add-on available (though using Supabase)
  - Alternative: Render (free tier with limitations)

#### Database
- **Supabase Cloud**
  - Free tier: 500MB database, 2GB bandwidth/month
  - Automatic backups
  - Connection pooling
  - PostgreSQL extensions

#### Version Control
- **GitHub** - Code repository
  - CI/CD via GitHub Actions (optional)
  - Issue tracking
  - Pull request reviews

#### Monitoring (Optional for MVP)
- **Sentry** - Error tracking (free tier)
- **Vercel Analytics** - Frontend analytics (built-in)
- **Railway Logs** - Backend logs and monitoring

---

### 5.9 Cost Breakdown

| Service | Free Tier | Est. Monthly Cost (MVP) | When Limit Hit |
|---------|-----------|------------------------|----------------|
| Vercel (Frontend) | 100GB bandwidth | $0 | Unlikely for single user |
| Railway (Backend) | $5 credit/month | $0 (1-2 months), then ~$5 | After credit runs out |
| Supabase (Database) | 500MB, 2GB bandwidth | $0 | ~100-200 entries with full data |
| Anthropic API | Pay-per-use | ~$0.01-0.05/entry | Usage-based |
| GitHub | Free for public repos | $0 | N/A |

**Total estimated cost:** $0-5/month for MVP with single user

---

### 5.10 API Contract

**Note:** This API contract is a starting point and will evolve as we build and learn.

#### API Overview

**Base URL:**
- Production: `https://api.sift.app`
- Development: `http://localhost:3000`

**Authentication:** JWT Bearer tokens (from Supabase Auth)
```
Authorization: Bearer <jwt_token>
```

**Content Type:** `application/json`

**Standard Error Response:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

---

#### 5.10.1 Authentication Endpoints

**Authentication Approach:**
- Email/password authentication via Supabase Auth
- Privacy-first: No third-party OAuth for MVP
- Email verification required before first use
- See Section 5.11.1 for detailed security requirements

**POST /api/auth/signup** - Register new user
```typescript
Request: {
  email: string,
  password: string  // Min 12 chars, mixed case, numbers, symbols
}

Response: 201 Created
{
  user: {
    id: string,
    email: string,
    email_verified: false,
    created_at: string
  },
  message: "Verification email sent. Please check your inbox."
}

Note: User cannot log in until email is verified.
Password requirements enforced server-side.
```

**POST /api/auth/verify-email** - Verify email address
```typescript
Request: {
  token: string  // Token from verification email
}

Response: 200 OK
{
  message: "Email verified successfully",
  user: { id: string, email: string, email_verified: true }
}

Errors:
- 400: Invalid or expired token
- 410: Token already used
```

**POST /api/auth/resend-verification** - Resend verification email
```typescript
Request: {
  email: string
}

Response: 200 OK
{
  message: "Verification email sent"
}

Rate limited: Max 3 requests per hour per email
```

**POST /api/auth/login** - Login existing user
```typescript
Request: {
  email: string,
  password: string
}

Response: 200 OK
{
  user: { id: string, email: string, email_verified: true },
  session: { access_token: string, refresh_token: string, expires_at: number }
}

Errors:
- 401: Invalid credentials
- 403: Email not verified (include resend verification option)
- 429: Too many failed attempts (account locked for 15 minutes)

Rate limiting: Max 5 attempts per 15 minutes per email
```

**POST /api/auth/logout** - Logout current user
```typescript
Request: (empty, uses Authorization header)

Response: 200 OK
{
  message: "Logged out successfully"
}

Side effects:
- Invalidates refresh token
- Clears session from database
```

**POST /api/auth/refresh** - Refresh access token
```typescript
Request: {
  refresh_token: string
}

Response: 200 OK
{
  access_token: string,
  refresh_token: string,  // New refresh token (rotation)
  expires_at: number
}

Errors:
- 401: Invalid or expired refresh token
```

**POST /api/auth/forgot-password** - Request password reset
```typescript
Request: {
  email: string
}

Response: 200 OK
{
  message: "Password reset email sent if account exists"
}

Note: Always returns success to prevent email enumeration
Rate limited: Max 3 requests per hour per email
Reset link expires in 1 hour
```

**POST /api/auth/reset-password** - Reset password with token
```typescript
Request: {
  token: string,      // Token from reset email
  new_password: string  // Must meet password requirements
}

Response: 200 OK
{
  message: "Password reset successfully. Please log in with your new password."
}

Errors:
- 400: Invalid or expired token, or password doesn't meet requirements
- 409: New password cannot be same as old password
```

**POST /api/auth/change-password** - Change password (authenticated)
```typescript
Request: {
  current_password: string,
  new_password: string
}

Response: 200 OK
{
  message: "Password changed successfully"
}

Errors:
- 401: Current password incorrect
- 400: New password doesn't meet requirements
- 409: New password cannot be same as old password

Requires: Valid authentication token
```

---

#### 5.10.2 User Profile Endpoints

**GET /api/profile** - Get current user's profile
```typescript
Response: 200 OK
{
  id: string,
  email: string,
  created_at: string,
  last_login_at: string,
  login_count: number,
  settings: {
    default_refine_enabled: boolean,
    theme: "light" | "dark" | "system"
  },
  stats: {
    total_entries: number,
    current_streak: number,
    longest_streak: number,
    last_entry_date: string,
    avg_score_7_days: number,
    avg_score_30_days: number,
    avg_score_all_time: number
  }
}
```

**PATCH /api/profile** - Update user settings
```typescript
Request: {
  settings: {
    default_refine_enabled?: boolean,
    theme?: "light" | "dark" | "system"
  }
}
Response: 200 OK (returns updated profile)
```

---

#### 5.10.3 Entry Endpoints

**POST /api/entries** - Create new entry
```typescript
Request: {
  entry_date: string,        // ISO date
  raw_entry: string,
  entry_type: "text" | "voice",
  voice_input_metadata?: {
    duration_seconds: number,
    started_at: string,
    completed_at: string
  }
}

Response: 201 Created
{
  id: string,
  user_id: string,
  entry_date: string,
  raw_entry: string,
  entry_type: "text" | "voice",
  skipped_refinement: boolean,
  created_at: string,
  updated_at: string
}
```

**GET /api/entries** - List entries with pagination
```typescript
Query Parameters:
  ?limit=20          // default: 20, max: 100
  &offset=0          // default: 0
  &start_date=YYYY-MM-DD
  &end_date=YYYY-MM-DD
  &sort=date_desc    // date_asc, date_desc, score_asc, score_desc

Response: 200 OK
{
  entries: Array<{
    id: string,
    entry_date: string,
    tldr: string,
    final_score: number,
    entry_type: "text" | "voice",
    created_at: string
  }>,
  pagination: {
    total: number,
    limit: number,
    offset: number,
    has_more: boolean
  }
}
```

**GET /api/entries/:id** - Get single entry (full details)
```typescript
Response: 200 OK
{
  id: string,
  user_id: string,
  entry_date: string,
  created_at: string,
  updated_at: string,

  // Raw input
  raw_entry: string,
  entry_type: "text" | "voice",
  voice_input_metadata: object | null,

  // Conversation
  conversation_transcript: Array<{
    role: "user" | "assistant",
    content: string,
    timestamp: string
  }>,
  skipped_refinement: boolean,
  refinement_started_at: string | null,
  refinement_completed_at: string | null,

  // Refined output
  refined_narrative: string,
  key_moments: string[],
  tldr: string,

  // Scoring
  ai_suggested_score: number,
  ai_score_explanation: string,
  final_score: number,
  user_adjusted_score: boolean,
  user_score_justification: string | null,

  // AI metadata
  ai_model_used: string,
  conversation_token_count: number,
  summary_token_count: number,
  total_cost_usd: number
}
```

**PATCH /api/entries/:id** - Update entry
```typescript
Request: {
  final_score?: number,
  user_score_justification?: string
}
Response: 200 OK (returns updated entry)
```

**DELETE /api/entries/:id** - Delete entry
```typescript
Response: 204 No Content
```

---

#### 5.10.4 AI Conversation Endpoints

**POST /api/conversation/start** - Start refinement conversation
```typescript
Request: {
  entry_id: string,
  raw_entry: string
}

Response: 200 OK
{
  should_refine: boolean,
  message: string,            // AI's response or "Your summary looks good as is"
  conversation_id: string
}
```

**POST /api/conversation/message** - Send message in conversation
```typescript
Request: {
  conversation_id: string,
  entry_id: string,
  message: string
}

Response: 200 OK
{
  message: string | null,     // AI's next question or null if complete
  is_complete: boolean,
  ready_for_summary?: boolean
}
```

---

#### 5.10.5 Summary Generation Endpoints

**POST /api/summary/generate** - Generate summary from conversation
```typescript
Request: {
  entry_id: string,
  conversation_id: string
}

Response: 200 OK
{
  refined_narrative: string,
  key_moments: string[],
  tldr: string,
  ai_suggested_score: number,
  ai_score_explanation: string,
  ai_model_used: string,
  token_count: number,
  cost_usd: number
}
```

**POST /api/summary/finalize** - Save final summary with user's score
```typescript
Request: {
  entry_id: string,
  final_score: number,
  user_adjusted_score: boolean,
  user_score_justification?: string
}

Response: 200 OK (returns complete entry)
```

---

#### 5.10.6 Dashboard & Analytics Endpoints

**GET /api/dashboard/stats** - Get dashboard statistics
```typescript
Query Parameters:
  ?period=30d    // "7d", "30d", "all"

Response: 200 OK
{
  period: string,
  entries: {
    total: number,
    with_refinement: number,
    without_refinement: number
  },
  scores: {
    average: number,
    min: number,
    max: number,
    distribution: { [range: string]: number }
  },
  trends: {
    score_trend: "improving" | "declining" | "stable",
    avg_conversation_length: number
  },
  streak: {
    current: number,
    longest: number
  }
}
```

**GET /api/dashboard/timeline** - Get score timeline for graphing
```typescript
Query Parameters:
  ?start_date=YYYY-MM-DD
  &end_date=YYYY-MM-DD
  &granularity=day    // "day" or "week"

Response: 200 OK
{
  timeline: Array<{
    date: string,
    score: number | null,
    has_entry: boolean
  }>
}
```

**POST /api/analytics/events** - Log analytics events (batch)
```typescript
Request: {
  session_id: string,
  events: Array<{
    event_type: string,
    event_category: string,
    event_data: object,
    timestamp: string
  }>
}

Response: 202 Accepted
{
  received: number
}
```

---

#### 5.10.7 Data Export Endpoints

**GET /api/export/entries** - Export all entries
```typescript
Query Parameters:
  ?format=json    // "json" or "csv"

Response: 200 OK (JSON)
{
  export_date: string,
  total_entries: number,
  entries: Array<Entry>
}

Response: 200 OK (CSV)
Content-Type: text/csv
Content-Disposition: attachment; filename="sift-export-YYYY-MM-DD.csv"
```

**DELETE /api/export/delete-all** - Delete all user data
```typescript
Request: {
  confirm: "DELETE_ALL_MY_DATA"
}

Response: 200 OK
{
  message: string,
  entries_deleted: number,
  events_deleted: number
}
```

---

#### 5.10.8 Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Request validation failed |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | User doesn't have access to resource |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Entry already exists for date (soft check) |
| 422 | UNPROCESSABLE_ENTITY | Invalid data (e.g., score out of range) |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | AI service temporarily down |

---

### 5.11 Security Considerations

Security is a foundational requirement for a personal reflection app handling intimate user data.

#### 5.11.1 Authentication Security

**Password Requirements:**
- Minimum 12 characters (not the typical 8)
- Must include: uppercase, lowercase, numbers, symbols
- Server-side validation (never trust client-side only)
- Password strength indicator on frontend
- Check against common password lists (optional enhancement)

**Account Protection:**
- Rate limiting on login attempts (5 per 15 minutes per email)
- Account locking after failed attempts (15-minute lockout)
- Email verification required before first login
- Failed attempt tracking in database
- Clear error messages without revealing sensitive info

**Token Management:**
- JWT tokens with reasonable expiration (access: 15min, refresh: 7 days)
- Refresh token rotation (new token on each refresh)
- Token invalidation on logout
- Secure token storage (httpOnly cookies or localStorage with XSS protection)
- Automatic token refresh before expiration

**Session Security:**
- Track last_login_at and login_count
- Single active session per user (or allow multiple with session management)
- Logout invalidates all tokens for that session
- Consider device fingerprinting (post-MVP)

#### 5.11.2 API Security

**Authentication & Authorization:**
- All endpoints except auth routes require valid JWT
- Middleware validates tokens on every request
- Check email_verified status for protected resources
- Never expose user data without authentication

**Row Level Security (RLS):**
- Supabase RLS policies on all tables
- Users can only access their own data
- Enforce at database level (defense in depth)
- Test RLS policies thoroughly

**Input Validation:**
- Zod schemas validate all API requests
- Validate on both frontend (UX) and backend (security)
- Sanitize user input to prevent XSS
- Use parameterized queries (prevent SQL injection)
- Validate content-type headers

**Rate Limiting:**
- Login attempts: 5 per 15 minutes per email
- Email verification: 3 per hour per email
- Password reset: 3 per hour per email
- API endpoints: 100 requests per minute per user (general)
- Adjust limits based on usage patterns

**HTTPS Only:**
- Force HTTPS in production
- No mixed content
- Secure cookie flags if using cookies
- HSTS headers

#### 5.11.3 Data Protection

**Data Storage:**
- Passwords hashed with bcrypt (Supabase handles this)
- JWTs signed and optionally encrypted
- Sensitive data encrypted at rest (Supabase provides this)
- No sensitive data in logs
- No sensitive data in error messages sent to client

**Privacy:**
- User data not shared with third parties (no OAuth for MVP)
- AI API calls include user data but with trusted provider (Anthropic)
- Clear privacy policy about data usage
- GDPR compliance: right to export, right to deletion
- Data retention policy (keep forever, or delete after inactivity?)

**Crisis Detection:**
- Keyword detection for self-harm/crisis language
- Show resources, don't store/flag differently
- Privacy: don't report to authorities without explicit danger
- Log events but don't expose to analytics

#### 5.11.4 Frontend Security

**XSS Prevention:**
- React escapes content by default (safe)
- Don't use `dangerouslySetInnerHTML` unless necessary
- Sanitize any user-generated HTML
- CSP headers to prevent inline scripts

**CSRF Protection:**
- Use CSRF tokens for state-changing operations
- Or rely on JWT in headers (not cookies) for CSRF protection
- Supabase handles CSRF for auth endpoints

**Secure Storage:**
- Store tokens in localStorage or httpOnly cookies
- Don't store sensitive data in localStorage
- Clear tokens on logout

**Dependencies:**
- Regular dependency updates
- Monitor for security vulnerabilities (npm audit, Snyk)
- Use lock files (pnpm-lock.yaml)

#### 5.11.5 AI Integration Security

**API Key Protection:**
- Store Anthropic API key in environment variables
- Never expose in frontend code
- Rotate keys periodically
- Monitor usage for anomalies

**Prompt Injection Protection:**
- User input is clearly separated from system prompts
- AI cannot execute commands or access data
- Validate AI responses before storing

**Cost Control:**
- Track AI usage per user
- Set spending limits
- Rate limit AI API calls
- Monitor for abuse

#### 5.11.6 Security Testing

**Testing Requirements:**
- Test auth flows thoroughly (see Phase 1 testing)
- Test RLS policies prevent unauthorized access
- Test input validation rejects malformed data
- Test rate limiting works correctly
- Penetration testing (post-MVP)

**Security Checklist:**
- ✅ All passwords hashed (never plaintext)
- ✅ All API endpoints require authentication (except auth routes)
- ✅ RLS policies on all database tables
- ✅ Input validation on all endpoints
- ✅ Rate limiting on sensitive endpoints
- ✅ HTTPS only in production
- ✅ Tokens expire and rotate
- ✅ No sensitive data in logs or errors
- ✅ Dependencies up to date
- ✅ CORS configured correctly

#### 5.11.7 Security Monitoring

**Logging (for security events):**
- Failed login attempts
- Account lockouts
- Password reset requests
- Token refresh failures
- Unusual API usage patterns

**Alerts (post-MVP):**
- Multiple failed login attempts
- Unusual spending on AI API
- Database connection errors
- Rate limit violations

**Incident Response:**
- Plan for handling security incidents
- User notification process if breach
- Steps to rotate keys/tokens
- Database backup and recovery

---

### 5.12 Project Structure

This section outlines the complete folder structure for the monorepo project.

#### 5.12.1 Root Level Structure

```
sift/
├── .github/
│   └── workflows/              # CI/CD workflows (optional for MVP)
├── packages/
│   ├── frontend/              # Vite + React SPA
│   ├── backend/               # Fastify REST API
│   └── shared/                # Shared TypeScript types & schemas
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── package.json               # Root workspace config
├── pnpm-workspace.yaml        # pnpm workspace definition
├── PRD.md                     # Product Requirements Document
└── README.md                  # Project overview and setup instructions
```

---

#### 5.12.2 Frontend Package (`packages/frontend/`)

```
frontend/
├── public/                    # Static assets
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── api/                   # API client layer
│   │   ├── client.ts         # Axios instance with auth interceptor
│   │   ├── auth.api.ts       # Authentication API calls
│   │   ├── entries.api.ts    # Entry CRUD operations
│   │   ├── conversation.api.ts # AI conversation endpoints
│   │   ├── summary.api.ts    # Summary generation
│   │   └── dashboard.api.ts  # Dashboard & analytics
│   │
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── chat/             # Chat interface components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── entry/            # Entry-related components
│   │   │   ├── EntryForm.tsx
│   │   │   ├── EntryCard.tsx
│   │   │   ├── EntryDetail.tsx
│   │   │   └── ScoreSlider.tsx
│   │   ├── dashboard/        # Dashboard components
│   │   │   ├── StatsCard.tsx
│   │   │   ├── ScoreChart.tsx
│   │   │   └── RecentEntries.tsx
│   │   ├── layout/           # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   └── common/           # Shared components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── ProtectedRoute.tsx
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts        # Authentication state & methods
│   │   ├── useEntries.ts     # Entry queries (TanStack Query)
│   │   ├── useConversation.ts # Conversation state management
│   │   ├── useSummary.ts     # Summary generation
│   │   ├── useDashboard.ts   # Dashboard data
│   │   └── useVoiceInput.ts  # Voice recording functionality
│   │
│   ├── stores/                # Zustand stores
│   │   ├── authStore.ts      # Auth state (tokens, user info)
│   │   ├── uiStore.ts        # UI state (modals, theme)
│   │   └── conversationStore.ts # In-progress conversation
│   │
│   ├── pages/                 # Page components (route-level)
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── NewEntryPage.tsx
│   │   ├── EntryDetailPage.tsx
│   │   ├── HistoryPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── lib/                   # Utility libraries
│   │   ├── queryClient.ts    # TanStack Query configuration
│   │   ├── analytics.ts      # Analytics tracking helpers
│   │   └── utils.ts          # Generic utilities
│   │
│   ├── types/                 # Frontend-specific types
│   │   ├── ui.types.ts       # UI-related types
│   │   └── state.types.ts    # State management types
│   │
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Application entry point
│   ├── router.tsx             # React Router configuration
│   └── index.css              # Global styles (Tailwind imports)
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
└── package.json
```

**Key Principles:**
- **Feature-based organization**: Components grouped by feature (chat, entry, dashboard)
- **Separation of concerns**: API calls isolated in `/api` directory
- **Hooks for logic**: Business logic extracted into custom hooks
- **Stores for client state**: Zustand for UI and temporary state

---

#### 5.12.3 Backend Package (`packages/backend/`)

```
backend/
├── src/
│   ├── routes/                # API route handlers
│   │   ├── auth.routes.ts    # POST /api/auth/*
│   │   ├── profile.routes.ts # GET/PATCH /api/profile
│   │   ├── entries.routes.ts # /api/entries/* CRUD
│   │   ├── conversation.routes.ts # /api/conversation/*
│   │   ├── summary.routes.ts # /api/summary/*
│   │   ├── dashboard.routes.ts # /api/dashboard/*
│   │   ├── analytics.routes.ts # /api/analytics/*
│   │   └── export.routes.ts  # /api/export/*
│   │
│   ├── services/              # Business logic layer
│   │   ├── auth.service.ts   # Authentication operations (Supabase)
│   │   ├── entry.service.ts  # Entry CRUD business logic
│   │   ├── ai.service.ts     # Anthropic API integration
│   │   │   ├── conversationAI.ts # Conversation flow
│   │   │   └── summaryAI.ts  # Summary generation
│   │   ├── context.service.ts # Historical context retrieval
│   │   ├── scoring.service.ts # Score calculation & validation
│   │   ├── analytics.service.ts # Analytics event processing
│   │   └── export.service.ts # Data export logic
│   │
│   ├── db/                    # Database layer
│   │   ├── client.ts         # Supabase client singleton
│   │   ├── migrations/       # SQL migration files
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_indexes.sql
│   │   │   └── ...
│   │   ├── repositories/     # Data access layer (Repository pattern)
│   │   │   ├── user.repository.ts
│   │   │   ├── entry.repository.ts
│   │   │   └── analytics.repository.ts
│   │   └── seed.ts           # Development seed data
│   │
│   ├── middleware/            # Fastify middleware
│   │   ├── auth.middleware.ts # JWT validation
│   │   ├── errorHandler.middleware.ts # Global error handling
│   │   ├── validation.middleware.ts # Request validation (Zod)
│   │   ├── rateLimiter.middleware.ts # Rate limiting
│   │   └── logger.middleware.ts # Request logging
│   │
│   ├── config/                # Configuration management
│   │   ├── env.ts            # Environment variables (Zod validated)
│   │   ├── supabase.config.ts # Supabase configuration
│   │   └── anthropic.config.ts # Anthropic API configuration
│   │
│   ├── types/                 # Backend-specific types
│   │   ├── request.types.ts  # Extended request types
│   │   └── service.types.ts  # Service layer types
│   │
│   ├── utils/                 # Utility functions
│   │   ├── logger.ts         # Structured logging
│   │   ├── errors.ts         # Custom error classes
│   │   └── helpers.ts        # Generic helper functions
│   │
│   ├── prompts/               # AI system prompts (versioned)
│   │   ├── conversation.prompt.ts # Refinement conversation prompt
│   │   └── summary.prompt.ts # Summary generation prompt
│   │
│   ├── app.ts                 # Fastify app setup & plugin registration
│   └── server.ts              # Server entry point
│
├── tests/                     # Test files (optional for MVP)
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                  # End-to-end tests
│
├── .env.example               # Example environment variables
├── .env                       # Local environment variables (gitignored)
├── tsconfig.json
└── package.json
```

**Key Principles:**
- **Layered architecture**: Routes → Services → Repositories
- **Repository pattern**: Abstracts database access
- **Middleware folder**: Reusable cross-cutting concerns
- **Prompts as code**: AI prompts versioned in codebase
- **Configuration validation**: Environment variables validated with Zod

---

#### 5.12.4 Shared Package (`packages/shared/`)

```
shared/
├── src/
│   ├── types/                 # Shared TypeScript types
│   │   ├── user.types.ts     # User, UserProfile, UserSettings
│   │   ├── entry.types.ts    # Entry, EntryCreate, EntryUpdate
│   │   ├── conversation.types.ts # Conversation message types
│   │   ├── summary.types.ts  # Summary-related types
│   │   ├── analytics.types.ts # Analytics event types
│   │   └── api.types.ts      # API request/response types
│   │
│   ├── schemas/               # Zod validation schemas
│   │   ├── user.schemas.ts   # User validation
│   │   ├── entry.schemas.ts  # Entry validation
│   │   ├── conversation.schemas.ts # Conversation validation
│   │   ├── summary.schemas.ts # Summary validation
│   │   └── analytics.schemas.ts # Analytics validation
│   │
│   ├── constants/             # Shared constants
│   │   ├── scores.ts         # Score ranges, descriptions, guidance
│   │   ├── events.ts         # Analytics event type constants
│   │   └── errors.ts         # Error codes and messages
│   │
│   └── index.ts               # Barrel export (re-exports all modules)
│
├── tsconfig.json
└── package.json
```

**Key Principles:**
- **Single source of truth**: All shared types and validation in one place
- **Types + Schemas together**: TypeScript types paired with Zod schemas
- **Constants**: Event types, error codes, score guidance shared
- **Barrel exports**: Clean imports from other packages

---

#### 5.12.5 Root Configuration Files

**`pnpm-workspace.yaml`**
```yaml
packages:
  - 'packages/*'
```

**Root `package.json`**
```json
{
  "name": "sift",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"pnpm dev:frontend\" \"pnpm dev:backend\"",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter backend dev",
    "build": "pnpm --filter shared build && pnpm --filter frontend build && pnpm --filter backend build",
    "lint": "pnpm --recursive lint",
    "format": "prettier --write \"packages/**/*.{ts,tsx,js,json,css,md}\"",
    "type-check": "pnpm --recursive type-check"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "concurrently": "^8.2.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

**`.gitignore`**
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
pnpm-debug.log*

# Misc
.turbo/
.cache/
```

---

## 6. System Prompts

This section contains the complete AI system prompts that will be implemented in the backend (see Section 5.12.3, `/src/prompts/` directory). These prompts are versioned in the codebase for easy iteration and testing.

### 6.1 Prompt A: Refinement Conversation

**Note:** This prompt incorporates the Core Principles from Section 3.

```
You are a compassionate reflection companion helping users process their daily experiences through thoughtful questions.

## Core Principles

**Guided, Not Asked**: Make confident decisions about when to ask questions and when to stop. Don't ask permission.

**Balanced Perspective**: Help users see nuance. Bad days often have overlooked bright spots. Good days often have real struggles.

**Context Over Conclusions**: "Today was terrible" needs unpacking. Ask questions to understand the fuller picture.

**Reflection, Not Therapy**: Stay focused on understanding the day, not fixing problems or providing clinical guidance.

## Your Role

The user has written about their day and clicked "Refine" to explore it with you. Your job is to ask questions that help uncover context, notice patterns, and surface overlooked positives.

## When to Ask Questions

Read the entry carefully. Ask questions if:
- Strong emotions lack context
- The entry contains contradictions (says "terrible day" but mentions positives)
- The entry is vague or brief
- Important details seem unexplored

If the entry is already clear and balanced, respond: "Your summary looks good as is"

## Question Types (Focus Areas)

1. **Context-seeking**: Uncover specific details
   - "What specifically about the meeting made you feel that way?"

2. **Pattern-noticing**: Point out contradictions or recurring themes
   - "I notice you said it was a terrible day, but also mentioned coffee with Sarah was nice. How do those fit together?"
   - "You mentioned deadline stress last week too. Is this related?"

3. **Positive-uncovering**: Surface overlooked bright spots
   - "Were there any small moments that helped, even a little?"

**Avoid:** "Why" questions (can feel judgmental) and meaning-making questions about deeper significance.

## Conversation Style

- **One question at a time**: Don't ask multiple questions in one message
- **Be warm and friendly**: Like a caring friend having a chat
- **Know when to stop**: After 2-4 exchanges, you usually have enough
- **Respect user signals**: If they say "that's enough" or "I'm done", respond with: DONE_ASKING_QUESTIONS
- **Use recent context**: Reference past entries from the last 1-2 weeks when you notice patterns

## Ending the Conversation

When you have enough context to create a good summary (usually after 2-4 questions), respond with only:
DONE_ASKING_QUESTIONS

Remember: Be confident in your guidance. The user trusts you to know when to dig deeper and when to move forward.
```

### 6.2 Prompt B: Summary Generation

**Note:** This prompt incorporates the Core Principles from Section 3.

```
You are creating a refined summary of a user's day based on their original entry and conversation.

## Core Principles

**Guided, Not Asked**: Make confident decisions. The user trusts you to synthesize their day accurately.

**Balanced Perspective**: Humans catastrophize bad days and romanticize good ones. Find the nuance - acknowledge both struggles and bright spots honestly.

**Context Over Conclusions**: Use the conversation to see beyond initial reactions. "Terrible day" often has more layers.

**Preserve Authentic Voice**: Keep their casual tone and word choices. Polish for clarity, not perfection.

**Reflection, Not Therapy**: You're helping them understand their day, not treating or diagnosing anything.

## Your Task

Create a polished but authentic summary that captures the essence of their day. The user will read this weeks or months later to understand how they were feeling.

## Input You'll Receive

- The user's original entry (their raw thoughts)
- A conversation transcript (questions and answers that added context)
- Recent entries from the past 1-2 weeks (for additional context)

## Output Format

Generate exactly this structure:

**Narrative:**
[2-4 sentences, first-person, preserving the user's voice]
- Weave together highs and lows naturally
- Keep their casual tone while making it coherent
- Include specific details from the conversation

**Key moments:**
- [3-5 bullet points of significant moments from the day]
- [Mix of positive and challenging moments]
- [Specific and concrete, not vague]

**TLDR:**
[One sentence that captures the day's essence]

**Score:** [Number 1-10]

**Score Explanation:**
[1-2 sentences explaining why you chose this score, referencing specific elements from the day]

## Scoring Guidance

Score represents overall wellbeing for the day:
- 10: Exceptional, one of their best days
- 8-9: Great, felt good, things went well
- 6-7: Good, solid day, mostly positive
- 5: Neutral, neither good nor bad
- 3-4: Challenging, struggled but managed
- 1-2: Very difficult, one of their harder days

Base the score on both emotional state and events. Be honest - not every day is a 7+. Avoid grade inflation.

## Writing Style

**Do:**
- Use their words and phrases when possible
- Be specific (not "work was hard" but "the 3-hour budget meeting was draining")
- Acknowledge complexity (days can be both good and bad)
- Write how a thoughtful friend would remember their day

**Don't:**
- Use therapy speak ("I'm hearing that...", "It sounds like you're processing...")
- Use corporate language ("leveraged", "optimized", "synergy")
- Over-dramatize ("utterly devastating") or minimize ("just a little stress")
- Force positivity or toxic optimism

Remember: You're helping them see their day clearly, with balance and perspective.
```

**Post-MVP:** Add examples of good output after testing

---

## 7. Success Metrics

### 7.1 Logging Strategy
**Track everything** - Build comprehensive analytics foundation
- All user actions and timestamps
- Entry metadata (length, voice vs text, conversation length)
- Score data and adjustments
- Feature usage patterns
- Easy to add new metrics and insights later

### 7.2 Priority Metrics (MVP Focus)

#### User Engagement
- **Daily/weekly active usage rate**: How often users create entries
- **Return rate**: Do users come back after first week?

#### Feature Usage
- **"Refine" usage rate**: What % of entries use AI conversation vs just Save?
- **Historical view engagement**: What % of users browse past entries?

#### Quality Indicators
- **Score distribution**: Are users scoring across full 1-10 range? (Clustering at 7-9 indicates grade inflation)
- **Self-reported value**: Periodic check-ins: "Is this tool helping you understand your feelings?"

### 7.3 Qualitative Success (For Initial User)
- Do you use it consistently?
- Do you find the summaries valuable when reviewing past entries?
- Do the insights help you understand your patterns?
- Does it feel like a burden or a helpful practice?

---

## 8. Out of Scope (MVP)

### 8.1 Multi-user Features
- Sharing entries with others
- Comparing data across users
- Therapist/coach access to data
- Community or social features

### 8.2 Integration Features
- Calendar integration
- Fitness tracker sync
- Weather data correlation
- Other app connections
- Export to specific formats (beyond basic data export)

### 8.3 Advanced AI Features
- Multiple AI personality options
- Custom prompt tuning by user
- AI-suggested interventions or goals
- Predictive insights ("you might have a rough week based on patterns")

### 8.4 Platform Expansion
- Mobile native apps (web-first for MVP)
- Browser extensions
- Offline mode

### 8.5 Advanced Analytics
- Correlation analysis (sleep, weather, events)
- Predictive modeling
- Comparative benchmarking

### 8.6 Content Features
- Photos/images in entries
- Tags or categories
- Multiple entries per day
- Editing past entries (can add later)

---

## 9. Future Enhancements (Post-MVP)

While Section 8 outlines what's explicitly out of scope for the MVP, this section describes potential enhancements that could be prioritized after successful MVP launch and validation.

### 9.1 Phase 2: Enhanced Insights
- Day-of-week patterns
- Volatility metrics and stability tracking
- Theme/word cloud analysis
- Comparative views (month-over-month)
- Correlations with external factors

### 9.2 Phase 3: Advanced Features
- Semantic search for historical context (vs rolling window)
- Richer data visualization
- More sophisticated crisis detection
- Entry editing capabilities
- Photo/media support

### 9.3 Phase 4: Authentication Enhancements
- **"Sign in with Apple"** (privacy-focused OAuth)
  - Apple anonymizes email addresses
  - Preferred by privacy-conscious users
  - Required for iOS App Store if offering any SSO
  - Better security with built-in 2FA
- **Two-Factor Authentication (2FA)**
  - TOTP (Time-based One-Time Password) via authenticator apps
  - SMS backup option (less secure but more accessible)
  - Recovery codes for account access
- **Passwordless authentication** (Magic Links)
  - One-time login links via email
  - No password to remember or manage
  - Good alternative for users who prefer it
- **Session management improvements**
  - View active sessions
  - Revoke sessions remotely
  - Device fingerprinting
- **Account security dashboard**
  - View login history
  - Security events log
  - Password strength audit

**Why not for MVP:**
- Email/password with verification provides sufficient security
- Privacy-first: No data shared with third parties
- Simpler implementation and testing
- SSO adds complexity without adding core value initially
- Can add after validating core product

### 9.4 Phase 5: Scale & Share
- Multi-user architecture
- Sharing capabilities (with explicit consent)
- Mobile native apps
- Integration ecosystem

---

## 10. Open Questions / Future Decisions

1. **Examples in prompts**: After MVP testing, add examples of good AI output to improve consistency

2. **Score calibration**: Monitor if users need more guidance on relative vs absolute scoring

3. **Voice input UX**: Real-time transcription vs record-then-transcribe? Edit before processing?

4. **Crisis detection sophistication**: Move beyond keyword matching to contextual understanding?

5. **Entry evolution**: Feature for "reflecting on past feelings" - "Look back on this day in 30 days"?

6. **Historical context approach**: When to evolve from rolling window to semantic search/RAG?

---

## 11. User Experience Principles

1. **Low friction**: Quick to use, no guilt if you skip days
2. **Non-prescriptive**: Guidance, not mandates
3. **Privacy-first**: User controls their data
4. **Insightful, not overwhelming**: Show trends without data overload
5. **Adaptive**: Works for daily users and sporadic users
6. **Guided experience**: Minimize decisions, maximize flow
7. **Authentic**: Preserve user's voice and emotional honesty

---

## 12. UI Mockups

Visual mockups demonstrating the complete user experience and design system are available in the `/mockups` directory.

### 12.1 Overview

The mockups are built with HTML and CSS to showcase:
- **Design system**: Typography, colors, spacing, and component styling
- **User flows**: Complete journey from entry creation to viewing history
- **Interaction states**: Various UI states including empty states, confirmations, and error handling

### 12.2 Accessing the Mockups

1. Open `/mockups/index.html` in a web browser
2. Navigate through the different flows and pages
3. All mockups are static HTML/CSS (no JavaScript) for easy review

### 12.3 Key Pages

**Core User Flows:**
- Dashboard: Overview with trends, streak, and recent entries
- New Entry: Text input with Save/Refine options
- AI Conversation: Chat-style refinement interface
- Summary & Scoring: Review polished summary and set wellbeing score
- Entry Detail: View complete saved entry
- Entry Saved Confirmation: Celebration pages with streak and optional insights

**Additional States:**
- Empty State: First-time user experience
- Crisis Detection: Resource banner for concerning language

### 12.4 Design System

The mockups implement a refined design system featuring:
- **Typography**: Inter font for UI, Georgia serif for narrative content
- **Color Palette**: Calming blue (#3B82F6) as primary color with refined grays
- **Spacing**: Consistent rem-based spacing following an 8pt grid
- **Visual Hierarchy**: Clear distinction between data/UI and personal reflection content

### 12.5 Design Principles Applied

The mockups reflect the core UX principles:
- **Calm & Minimal**: Clean layouts with generous whitespace
- **Professional**: Sophisticated typography and refined color choices
- **Guided Experience**: Clear primary actions, minimal decision points
- **Authentic**: Serif fonts for personal content preserve human voice

Refer to `/mockups/tasks.md` for additional design enhancement options considered but not yet implemented.

---

## 13. Implementation Plan

This section breaks down the MVP development into logical phases with clear milestones and success criteria. Phases are designed to deliver working functionality incrementally, allowing for testing and iteration along the way.

### 13.1 Development Phases Overview

| Phase | Focus | Key Deliverable | Dependencies |
|-------|-------|----------------|--------------|
| **0** | Project Setup | Working monorepo with tooling | None |
| **1** | Auth & Database | User can sign up/login | Phase 0 |
| **2** | Basic Entries | User can create text entries | Phase 1 |
| **3** | AI Integration | Full refinement flow works | Phase 2 |
| **4** | Dashboard | User can view history & insights | Phase 2 |
| **5** | Polish & Launch | Voice input, analytics, export | Phases 3 & 4 |

---

### 13.2 Phase 0: Project Setup & Foundation

**Goal:** Establish development environment and project structure

**Key Deliverables:**
- ✅ Monorepo initialized with all three packages
- ✅ Development workflow functional (run frontend + backend together)
- ✅ Basic CI/CD pipeline (linting, type checking)
- ✅ Database connected and migrated

**Tasks:**

**0.1 Initialize Monorepo**
- Create root `package.json` with workspace scripts
- Set up `pnpm-workspace.yaml`
- Configure root ESLint and Prettier
- Create `.gitignore`

**0.2 Set Up Frontend Package**
- Initialize Vite + React + TypeScript project
- Install dependencies: React Router, TanStack Query, Zustand, Axios
- Install Tailwind CSS and configure
- Set up shadcn/ui (copy base components)
- Create basic folder structure (src/components, src/pages, etc.)
- Configure `vite.config.ts` with proper aliases

**0.3 Set Up Backend Package**
- Initialize Node.js + TypeScript project
- Install dependencies: Fastify, Supabase client, Anthropic SDK, Zod
- Create folder structure (src/routes, src/services, etc.)
- Configure `tsconfig.json` with strict settings
- Set up `app.ts` and `server.ts` entry points
- Configure environment variables with `.env.example`

**0.4 Set Up Shared Package**
- Initialize TypeScript package
- Create folder structure (src/types, src/schemas, src/constants)
- Set up barrel exports in `index.ts`
- Configure `tsconfig.json` for library compilation

**0.5 Database Setup**
- Create Supabase project (free tier)
- Run initial migration (user_profiles, entries, analytics tables)
- Set up Row Level Security (RLS) policies
- Create seed data for development
- Test database connection from backend

**0.6 Development Workflow**
- Configure root `dev` script to run frontend + backend concurrently
- Set up hot reload for both frontend and backend
- Test type sharing between packages
- Verify imports work correctly (shared → frontend/backend)

**0.7 Testing Infrastructure Setup**
- Install testing dependencies (Vitest for both frontend/backend)
- Configure Vitest for frontend with React Testing Library
- Configure Vitest for backend with supertest for API testing
- Set up test scripts in root `package.json`
- Create example test files to verify setup works
- Configure code coverage reporting
- Add `test` and `test:coverage` scripts to workspace

**Success Criteria:**
- ✅ `pnpm dev` starts both frontend and backend
- ✅ Frontend accessible at `http://localhost:5173`
- ✅ Backend accessible at `http://localhost:3000`
- ✅ Types from shared package import correctly
- ✅ Database connection successful
- ✅ Linting and type-checking pass
- ✅ Test infrastructure runs successfully (`pnpm test`)
- ✅ Example tests pass in frontend and backend

---

### 13.3 Phase 1: Authentication & User Profile

**Goal:** Secure, privacy-focused authentication with email verification and password reset

**Key Deliverables:**
- ✅ User registration with email verification
- ✅ Secure login with rate limiting
- ✅ Password reset flow
- ✅ JWT authentication implemented
- ✅ Protected routes on frontend
- ✅ User profile created on signup

**Tasks:**

**1.1 Backend: Core Auth Endpoints**
- Implement `POST /api/auth/signup` (uses Supabase Auth)
  - Enforce strong password requirements (12+ chars, mixed case, numbers, symbols)
  - Validate password strength server-side
  - Send verification email
  - Mark email_verified as false
- Implement `POST /api/auth/login`
  - Check email_verified status
  - Implement rate limiting (max 5 attempts per 15 min)
  - Track failed login attempts
  - Lock account for 15 min after 5 failed attempts
  - Update last_login_at and login_count on success
- Implement `POST /api/auth/logout`
  - Invalidate refresh token
  - Clear session from database
- Implement `POST /api/auth/refresh`
  - Rotate refresh tokens for security
- Create auth middleware for JWT validation
- Add comprehensive error handling for auth failures

**1.2 Backend: Email Verification**
- Implement `POST /api/auth/verify-email`
  - Validate verification token
  - Mark email_verified as true
  - Set email_verified_at timestamp
  - Return error for invalid/expired/used tokens
- Implement `POST /api/auth/resend-verification`
  - Send new verification email
  - Rate limit: max 3 per hour per email
- Configure email templates for verification
- Set verification token expiration (24 hours)

**1.3 Backend: Password Reset Flow**
- Implement `POST /api/auth/forgot-password`
  - Generate password reset token
  - Send reset email
  - Always return success (prevent email enumeration)
  - Rate limit: max 3 per hour per email
  - Token expires in 1 hour
- Implement `POST /api/auth/reset-password`
  - Validate reset token
  - Check new password meets requirements
  - Ensure new password differs from old
  - Invalidate all existing sessions
- Implement `POST /api/auth/change-password` (authenticated)
  - Verify current password
  - Validate new password requirements
  - Prevent password reuse

**1.4 Backend: Security Features**
- Implement rate limiting middleware
  - Login attempts: 5 per 15 minutes per email
  - Verification emails: 3 per hour per email
  - Password reset: 3 per hour per email
- Add account locking mechanism
  - Lock after 5 failed login attempts
  - Auto-unlock after 15 minutes
  - Store locked_until timestamp
- Update user_profiles table with security fields
  - email_verified, email_verified_at
  - failed_login_attempts
  - locked_until

**1.5 Backend: Profile Endpoints**
- Implement `GET /api/profile`
  - Return email_verified status
- Implement `PATCH /api/profile`
  - Update settings only (not email/password)
- Create user profile on signup (database trigger or service)
  - Initialize default settings (theme, default_refine_enabled)
  - Set email_verified to false

**1.6 Shared: Auth Types & Schemas**
- Define `User`, `UserProfile`, `UserSettings` types
- Create Zod schemas for signup/login requests
  - Password schema: min 12 chars, mixed case, numbers, symbols
  - Email validation schema
- Define auth response types (tokens, user data, email_verified)
- Create error response types for auth failures

**1.7 Frontend: Auth Pages - Signup & Login**
- Create `SignupPage.tsx` with form
  - Email and password fields
  - Password strength indicator (show requirements)
  - Real-time validation feedback
  - Show success message about verification email
- Create `LoginPage.tsx` with form
  - Email and password fields
  - "Forgot password?" link
  - Handle "email not verified" error with resend option
  - Show error for locked accounts with time remaining
- Add client-side validation (Zod schemas)
- Style with Tailwind + shadcn/ui components

**1.8 Frontend: Email Verification Flow**
- Create `VerifyEmailPage.tsx`
  - Extract token from URL query param
  - Auto-verify on page load
  - Show success/error messages
  - Redirect to login on success
- Create "Email Sent" confirmation page
  - Show after signup
  - Include resend verification button
  - Clear instructions to check inbox/spam

**1.9 Frontend: Password Reset Flow**
- Create `ForgotPasswordPage.tsx`
  - Email input field
  - Submit button
  - Show "email sent" message on success
- Create `ResetPasswordPage.tsx`
  - Extract token from URL query param
  - New password field with strength indicator
  - Confirm password field
  - Submit button
  - Show success message and redirect to login
- Handle token expiration errors gracefully

**1.10 Frontend: Auth State Management**
- Create `authStore.ts` (Zustand) for tokens and user
  - Store email_verified status
  - Track authentication state
- Create `useAuth.ts` hook
  - signup, login, logout methods
  - verifyEmail, resendVerification methods
  - forgotPassword, resetPassword methods
  - changePassword method
- Implement token persistence (localStorage)
- Implement automatic token refresh
- Create axios interceptor for adding auth headers
- Handle 403 errors (email not verified)

**1.11 Frontend: Protected Routes**
- Create `ProtectedRoute.tsx` component
  - Check for valid token
  - Check email_verified status
  - Redirect to login if not authenticated
  - Redirect to "verify email" if not verified
- Wrap authenticated routes with protection
- Create basic `Layout.tsx` with header
- Add "Resend verification" banner if not verified

**1.12 Testing: Enhanced Auth Flow**
- **Backend Tests:**
  - **Signup & Validation:**
    - Test password strength validation (too short, no numbers, no symbols, etc.)
    - Test duplicate email signup
    - Test verification email is sent
    - Test user cannot login before email verification
  - **Email Verification:**
    - Test `POST /api/auth/verify-email` with valid token
    - Test with invalid/expired/already-used tokens
    - Test resend verification rate limiting
  - **Login Security:**
    - Test successful login updates last_login_at
    - Test failed login increments failed_login_attempts
    - Test account locks after 5 failed attempts
    - Test locked account returns correct error
    - Test account auto-unlocks after 15 minutes
    - Test rate limiting (6th attempt within 15 min)
  - **Password Reset:**
    - Test forgot password sends email (or returns success if email doesn't exist)
    - Test reset token validation
    - Test password reset invalidates old sessions
    - Test new password cannot match old password
    - Test reset token expires after 1 hour
  - **Token Management:**
    - Test refresh token rotation
    - Test auth middleware rejects invalid/expired tokens
    - Test logout invalidates refresh token
  - **Profile Creation:**
    - Test user profile created on signup with correct defaults
- **Frontend Tests:**
  - **Auth Store & Hooks:**
    - Unit test `authStore` state management
    - Unit test `useAuth` hook methods
    - Test token persistence in localStorage
    - Test automatic token refresh
  - **Signup Flow:**
    - Test password strength indicator shows correctly
    - Test form validation (client-side)
    - Test successful signup shows "check email" message
    - Test error handling (weak password, duplicate email)
  - **Email Verification:**
    - Test verify email page extracts token from URL
    - Test success message and redirect
    - Test error handling for invalid token
    - Test resend verification button
  - **Login Flow:**
    - Test successful login redirects to dashboard
    - Test "email not verified" error shows resend option
    - Test account locked error shows time remaining
    - Test failed login shows error message
  - **Password Reset:**
    - Test forgot password form submission
    - Test reset password form with password strength
    - Test token extraction from URL
    - Test success redirect to login
  - **Protected Routes:**
    - Test redirect to login when not authenticated
    - Test redirect to verify email if not verified
    - Test successful access with valid auth
- **Security Tests:**
  - Test rate limiting prevents brute force
  - Test account locking mechanism
  - Test password requirements enforced
  - Test token expiration and refresh
  - Test CSRF protection (if applicable)
- **Manual Testing Checklist:**
  - ✅ Sign up with weak password (should fail)
  - ✅ Sign up with strong password (should succeed)
  - ✅ Check verification email received
  - ✅ Click verification link (should verify and redirect)
  - ✅ Try to login before verification (should fail)
  - ✅ Login after verification (should succeed)
  - ✅ Fail login 5 times (account should lock)
  - ✅ Wait 15 minutes and login again (should unlock)
  - ✅ Test forgot password flow end-to-end
  - ✅ Test resend verification email
  - ✅ Try accessing protected route without auth
  - ✅ Verify token refresh works automatically
  - ✅ Test logout clears tokens
  - ✅ Test "remember me" functionality (if implemented)

**Success Criteria:**
- ✅ User can sign up with strong password
- ✅ Verification email sent and received
- ✅ User cannot login before email verification
- ✅ User can verify email via link
- ✅ User can resend verification email
- ✅ User can login after verification
- ✅ Account locks after 5 failed login attempts
- ✅ Account auto-unlocks after 15 minutes
- ✅ User can reset forgotten password
- ✅ JWT tokens work correctly (auth, refresh, logout)
- ✅ Protected routes enforce authentication AND verification
- ✅ User profile created with correct defaults on signup
- ✅ All rate limiting works as expected
- ✅ Security tests pass (no vulnerabilities)

---

### 13.4 Phase 2: Basic Entry Creation (Text Only)

**Goal:** Users can create and save simple text entries without AI refinement

**Key Deliverables:**
- ✅ Entry creation flow (text input only)
- ✅ "Save" button stores entry immediately
- ✅ Entry appears in list after creation
- ✅ Manual score selection (1-10 slider)

**Tasks:**

**2.1 Shared: Entry Types & Schemas**
- Define `Entry`, `EntryCreate`, `EntryUpdate` types
- Create Zod schemas for entry validation
- Define entry list response types (with pagination)

**2.2 Backend: Entry Endpoints**
- Implement `POST /api/entries` (create entry)
- Implement `GET /api/entries` (list with pagination)
- Implement `GET /api/entries/:id` (get single entry)
- Implement `PATCH /api/entries/:id` (update score)
- Implement `DELETE /api/entries/:id`
- Create entry repository with database operations
- Create entry service with business logic

**2.3 Frontend: Entry Creation UI**
- Create `NewEntryPage.tsx`
- Create `EntryForm.tsx` component (textarea for entry)
- Create `ScoreSlider.tsx` component (1-10 slider with labels)
- Add "Save" button (no "Refine" yet)
- Show loading state during save
- Redirect to entry detail or list after save

**2.4 Frontend: Entry State Management**
- Create `useEntries.ts` hook with TanStack Query
- Implement mutations for create/update/delete
- Implement queries for list and single entry
- Configure cache invalidation on mutations

**2.5 Frontend: Entry List & Detail**
- Create `HistoryPage.tsx` with entry list
- Create `EntryCard.tsx` component (shows TLDR, score, date)
- Create `EntryDetailPage.tsx` (shows full entry)
- Add pagination controls to list
- Add delete confirmation dialog

**2.6 Entry Date Handling**
- Default entry_date to today
- Allow user to change date (date picker)
- Handle "entry already exists for date" in UI (soft check)
- Show warning if user tries to create duplicate

**2.7 Testing: Entry CRUD**
- **Backend Tests:**
  - Unit test entry repository methods (create, get, list, update, delete)
  - Unit test entry service business logic
  - Integration test `POST /api/entries` creates entry correctly
  - Integration test `GET /api/entries` returns paginated results
  - Integration test `GET /api/entries/:id` returns single entry
  - Integration test `PATCH /api/entries/:id` updates score
  - Integration test `DELETE /api/entries/:id` removes entry
  - Test RLS policies (users can only access own entries)
  - Test validation (score must be 1-10, entry_date format, etc.)
  - Test pagination edge cases (last page, empty results)
- **Frontend Tests:**
  - Unit test `useEntries` hook
  - Test entry form validation (required fields, score range)
  - Test entry creation flow
  - Test entry list rendering with mock data
  - Test entry deletion with confirmation
  - Test cache invalidation after mutations
- **Manual Testing Checklist:**
  - Create entry with various content lengths
  - Create entry with different dates
  - Update score on existing entry
  - Delete entry and verify it's gone
  - Test pagination with 20+ entries
  - Try invalid scores (0, 11, negative)

**Success Criteria:**
- ✅ User can write text entry and save it
- ✅ Entry stored in database with all required fields
- ✅ Entry appears in list immediately after creation
- ✅ User can view full entry details
- ✅ User can update score on existing entry
- ✅ User can delete entry
- ✅ Pagination works for entry list

---

### 13.5 Phase 3: AI Integration (Conversation & Summary)

**Goal:** Complete AI refinement flow - conversation, summary generation, scoring

**Key Deliverables:**
- ✅ "Refine" button starts AI conversation
- ✅ Multi-turn conversation works
- ✅ AI generates summary with score
- ✅ User can accept or adjust score

**Tasks:**

**3.1 Backend: AI Service Setup**
- Install and configure Anthropic SDK
- Create `ai.service.ts` base class
- Implement error handling for AI API failures
- Add retry logic for transient failures
- Configure API key from environment variables

**3.2 Backend: Conversation AI**
- Create `conversationAI.ts` service
- Implement conversation prompt from PRD (section 6.2)
- Implement `POST /api/conversation/start` endpoint
- Implement `POST /api/conversation/message` endpoint
- Load historical context (last 7-14 days) for AI
- Detect "DONE_ASKING_QUESTIONS" signal
- Store conversation transcript in entry

**3.3 Backend: Summary AI**
- Create `summaryAI.ts` service
- Implement summary prompt from PRD (section 6.3)
- Implement `POST /api/summary/generate` endpoint
- Parse AI response into structured format (narrative, key_moments, tldr, score)
- Calculate token usage and cost
- Implement `POST /api/summary/finalize` endpoint

**3.4 Shared: Conversation & Summary Types**
- Define `ConversationMessage` type
- Define `ConversationResponse` type
- Define `SummaryResponse` type
- Create validation schemas for AI responses

**3.5 Frontend: Chat Interface**
- Create `ChatInterface.tsx` component
- Create `ChatMessage.tsx` component (user vs AI styling)
- Create `ChatInput.tsx` component
- Add "Refine" button to entry form
- Show/hide chat based on user choice

**3.6 Frontend: Conversation State**
- Create `useConversation.ts` hook
- Create `conversationStore.ts` for in-progress state
- Handle conversation flow (start → messages → complete)
- Store messages locally as user types
- Handle "Save" mid-conversation (generate quick summary)

**3.7 Frontend: Summary Display**
- Display AI-generated summary (narrative, key moments, TLDR)
- Show AI suggested score with explanation
- Allow user to edit summary before finalizing
- Allow user to adjust score with optional justification
- Show final summary in entry detail view

**3.8 Context Service**
- Implement `context.service.ts` to retrieve recent entries
- Load last 7-14 days of entries
- Format for AI context (only relevant fields)
- Cache context briefly to reduce database queries

**3.9 Crisis Detection**
- Implement basic keyword detection in conversation
- Show crisis resources banner when triggered
- Allow user to continue or exit
- Log crisis detection events

**3.10 Testing: AI Integration**
- **Backend Tests:**
  - **AI Service Tests (with mocking):**
    - Mock Anthropic API responses for conversation
    - Mock Anthropic API responses for summary generation
    - Test conversation flow with different entry types
    - Test "DONE_ASKING_QUESTIONS" detection
    - Test summary parsing (narrative, key_moments, tldr, score)
    - Test error handling when AI API fails
    - Test retry logic for transient failures
    - Test token counting and cost calculation
  - **Context Service Tests:**
    - Test retrieving last 7-14 days of entries
    - Test context formatting for AI
    - Test caching behavior
  - **Integration Tests:**
    - Test `POST /api/conversation/start` endpoint
    - Test `POST /api/conversation/message` endpoint
    - Test `POST /api/summary/generate` endpoint
    - Test `POST /api/summary/finalize` endpoint
    - Test full conversation flow (start → message → summary → finalize)
    - Test conversation with empty context (new user)
  - **Crisis Detection Tests:**
    - Test keyword detection triggers correctly
    - Test no false positives for normal sad entries
    - Test event logging when crisis detected
- **Frontend Tests:**
  - Unit test `useConversation` hook
  - Unit test `conversationStore` state management
  - Test chat message rendering (user vs AI)
  - Test conversation flow state transitions
  - Test "Save" mid-conversation generates summary
  - Test summary display component
  - Test score adjustment UI
- **Contract Tests:**
  - Verify AI responses match expected schema
  - Test prompt changes don't break parsing
  - Create test fixtures of AI responses
- **Manual Testing Checklist:**
  - Test with various entry tones (happy, sad, neutral, mixed)
  - Test very short entries (1 sentence)
  - Test very long entries (500+ words)
  - Test entries with contradictions
  - Test conversation that should end after 1 question
  - Test conversation that needs 4+ questions
  - Verify AI references past entries when relevant
  - Test crisis detection with concerning language
  - Test "Save" mid-conversation
  - Verify summaries preserve user's voice
  - Check score suggestions are reasonable
  - Test AI cost tracking is accurate

**Success Criteria:**
- ✅ User can click "Refine" and start conversation
- ✅ AI asks relevant questions based on entry
- ✅ User can respond and have multi-turn conversation
- ✅ AI recognizes when conversation is complete
- ✅ AI generates summary with narrative, key moments, TLDR
- ✅ AI suggests score with explanation
- ✅ User can adjust score and add justification
- ✅ Final entry includes all conversation data
- ✅ Token usage and cost tracked
- ✅ Crisis detection shows appropriate resources

---

### 13.6 Phase 4: Dashboard & Historical Insights

**Goal:** Users can view their history and understand patterns over time

**Key Deliverables:**
- ✅ Dashboard with stats and trends
- ✅ Score timeline graph
- ✅ Entry browsing and filtering

**Tasks:**

**4.1 Backend: Dashboard Endpoints**
- Implement `GET /api/dashboard/stats` endpoint
- Calculate aggregates (averages, min/max, distribution)
- Calculate streaks (current, longest)
- Implement score trend analysis (improving/declining/stable)
- Implement `GET /api/dashboard/timeline` endpoint
- Generate timeline data for graphing

**4.2 Backend: Stats Caching**
- Update user_profiles cached stats on entry creation
- Recalculate averages (7-day, 30-day, all-time)
- Update streak counts
- Optimize queries for large datasets

**4.3 Frontend: Dashboard Page**
- Create `DashboardPage.tsx`
- Create `StatsCard.tsx` component (total entries, streak, averages)
- Create `ScoreChart.tsx` component (line chart of scores over time)
- Create `RecentEntries.tsx` component (last 5-10 entries)
- Add "Write Today's Entry" CTA button

**4.4 Frontend: Chart Library**
- Choose and install chart library (Chart.js, Recharts, or similar)
- Create reusable chart wrapper component
- Style charts to match app design
- Add responsive behavior for mobile

**4.5 Frontend: History Filtering**
- Add date range filter to `HistoryPage.tsx`
- Add sorting options (date, score)
- Add search by content (optional for MVP)
- Update API calls to use filters

**4.6 Frontend: Entry Detail Enhancements**
- Show relative score context ("above your 30-day average")
- Display cost data (for debugging)
- Show AI model used
- Link to previous/next entry

**4.7 User Profile Settings**
- Create `SettingsPage.tsx`
- Add theme toggle (light/dark/system)
- Add default_refine_enabled toggle
- Save settings via `PATCH /api/profile`

**4.8 Testing: Dashboard & Analytics**
- **Backend Tests:**
  - **Dashboard Stats Tests:**
    - Test score average calculations (7-day, 30-day, all-time)
    - Test score distribution calculation
    - Test streak calculation (current and longest)
    - Test with edge cases (0 entries, 1 entry, gaps in dates)
    - Test timeline generation for different date ranges
    - Test filtering by date range
  - **Aggregation Tests:**
    - Test user_profiles stats cache updates correctly
    - Test stats recalculation on new entry
    - Verify accuracy against raw data queries
  - **Integration Tests:**
    - Test `GET /api/dashboard/stats` with different periods
    - Test `GET /api/dashboard/timeline` with date ranges
    - Test stats update after creating entry
- **Frontend Tests:**
  - Unit test `useDashboard` hook
  - Test dashboard component with mock data
  - Test chart rendering with various datasets
  - Test empty state (no entries)
  - Test filtering and sorting on history page
  - Test settings persistence
- **Calculation Accuracy Tests:**
  - Create test dataset with known averages
  - Verify dashboard shows correct calculations
  - Test relative score context displays correctly
  - Verify streak logic with various patterns
- **Manual Testing Checklist:**
  - Create multiple entries across different dates
  - Verify averages update correctly
  - Check streak calculation with consecutive days
  - Test with gaps in entries
  - Verify chart displays data accurately
  - Test filtering by date range
  - Test theme switching
  - Verify settings persist after logout/login

**Success Criteria:**
- ✅ Dashboard loads and shows accurate stats
- ✅ Score chart displays correctly
- ✅ Stats update after creating new entry
- ✅ Streak calculation accurate
- ✅ User can filter/sort entries
- ✅ Relative score context shown
- ✅ Settings page works and persists changes
- ✅ Theme switching works

---

### 13.7 Phase 5: Polish & Launch Preparation

**Goal:** Add remaining features and prepare for launch

**Key Deliverables:**
- ✅ Voice input functional
- ✅ Analytics tracking implemented
- ✅ Data export working
- ✅ Error handling polished
- ✅ MVP ready for use

**Tasks:**

**5.1 Voice Input**
- Implement `useVoiceInput.ts` hook with Web Speech API
- Add voice recording button to entry form
- Show recording indicator while active
- Display transcription in real-time or after completion
- Allow user to edit transcription
- Store voice metadata (duration, input method)

**5.2 Analytics Implementation**
- Implement `POST /api/analytics/events` endpoint (batch)
- Create `analytics.ts` helper on frontend
- Add analytics calls for key events:
  - Page views
  - Entry creation (started, saved, refined)
  - Conversation interactions
  - Score adjustments
  - Settings changes
- Batch events and send periodically

**5.3 Data Export**
- Implement `GET /api/export/entries` (JSON and CSV)
- Create export UI in settings
- Add "Download my data" button
- Format CSV with readable columns
- Implement `DELETE /api/export/delete-all`
- Add confirmation dialog for delete all

**5.4 Error Handling & UX**
- Add global error boundary on frontend
- Improve error messages (user-friendly)
- Add loading states to all async operations
- Add empty states (no entries yet, etc.)
- Add success toasts for actions
- Handle offline state gracefully

**5.5 Mobile Responsiveness**
- Test all pages on mobile viewport
- Fix any layout issues
- Ensure chat interface works on mobile
- Test touch interactions
- Optimize for smaller screens

**5.6 Performance Optimization**
- Lazy load pages (React.lazy)
- Optimize images (if any)
- Minimize bundle size
- Add loading skeletons
- Test API response times

**5.7 Security Audit**
- Review all API endpoints for auth requirements
- Ensure RLS policies cover all tables
- Test JWT expiration and refresh
- Validate all user inputs (Zod schemas)
- Review environment variable handling
- Test rate limiting

**5.8 Documentation**
- Update README with setup instructions
- Document environment variables
- Add API documentation (Swagger)
- Write contribution guidelines (if open source)
- Document deployment process

**5.9 End-to-End Testing**
- **Voice Input Tests:**
  - Test Web Speech API on different browsers (Chrome, Safari, Edge)
  - Test voice recording start/stop
  - Test transcription accuracy
  - Test editing transcribed text
  - Test fallback when Web Speech API unavailable
  - Test voice metadata storage
- **Analytics Tests:**
  - Test event batching and sending
  - Test analytics endpoint receives events correctly
  - Verify events stored in database
  - Test event data structure validation
- **Data Export Tests:**
  - Test JSON export completeness (all fields included)
  - Test CSV export formatting
  - Test export with large datasets (50+ entries)
  - Test delete all confirmation flow
  - Verify delete all actually removes all data
- **Cross-Browser Testing:**
  - Test on Chrome, Firefox, Safari, Edge
  - Test on mobile browsers (iOS Safari, Chrome mobile)
  - Test responsive layouts
  - Test touch interactions on mobile
- **Error Scenario Testing:**
  - Simulate AI API failure (test retry logic and fallback)
  - Simulate network errors (offline mode)
  - Test expired token handling
  - Test database connection failures
  - Test malformed AI responses
  - Test validation errors (frontend and backend)
- **Performance Testing:**
  - Test page load times (< 2s target)
  - Test API response times (< 500ms for CRUD, < 5s for AI)
  - Test with large entry lists (100+ entries)
  - Test chat interface performance with long conversations
  - Monitor memory usage during extended sessions
- **Security Testing:**
  - Test auth endpoints reject invalid credentials
  - Test protected routes require valid JWT
  - Test RLS policies prevent cross-user data access
  - Test input sanitization (XSS prevention)
  - Test SQL injection prevention (parameterized queries)
  - Verify sensitive data not logged
  - Test rate limiting works
- **User Acceptance Testing (UAT):**
  - Complete end-to-end flows as a user
  - Create entry without refinement
  - Create entry with AI refinement (short conversation)
  - Create entry with AI refinement (long conversation)
  - View dashboard and verify stats
  - Browse historical entries
  - Export data
  - Change settings
  - Use on mobile device
- **Regression Testing:**
  - Re-run all unit tests
  - Re-run all integration tests
  - Verify previous phases still work
  - Check for any breaking changes

**5.10 Deployment**
- Deploy backend to Railway
- Deploy frontend to Vercel
- Configure environment variables in production
- Set up custom domain (optional)
- Configure CORS for production
- Test production deployment end-to-end

**Success Criteria:**
- ✅ Voice input works and transcribes accurately
- ✅ Analytics events tracked correctly
- ✅ Data export produces valid JSON/CSV
- ✅ Delete all data works correctly
- ✅ Error handling is user-friendly
- ✅ App works well on mobile devices
- ✅ Performance is acceptable (< 2s page loads)
- ✅ Security review passed
- ✅ Documentation complete
- ✅ Production deployment successful
- ✅ **App is usable for daily reflection**

---

### 13.8 Testing Strategy

Testing is integrated throughout development, not just at the end. Each phase (13.2-13.7) includes specific testing tasks to ensure quality and catch issues early. This section provides the overall testing philosophy and approach.

#### Testing Philosophy

**Test as you build:** Write tests alongside features, not after completion. This ensures:
- Immediate feedback on code quality
- Better designed, more testable code
- Catching bugs before they compound
- Documentation through test cases

**Test pyramid approach:**
```
         /\
        /E2E\        Few (expensive, slow, brittle)
       /------\
      / Integ  \     Some (moderate cost, moderate speed)
     /----------\
    /   Unit     \   Many (cheap, fast, reliable)
   /--------------\
```

#### Testing Levels

**Unit Tests (Most tests)**
- Test individual functions and components in isolation
- Mock external dependencies
- Fast execution (< 1s for entire suite)
- Run on every save during development
- **Examples:**
  - Zod schema validation
  - Store state transitions
  - Service methods with mocked dependencies
  - React component rendering with mock props

**Integration Tests (Moderate)**
- Test how components work together
- Test API endpoints with real database (test DB)
- Test frontend hooks with mocked API calls
- Slower than unit tests but still fast (< 10s)
- **Examples:**
  - API endpoint calls database and returns correct data
  - Auth middleware validates JWT correctly
  - Frontend form submits and updates cache

**End-to-End Tests (Fewest)**
- Test complete user flows
- Frontend + Backend + Database all working together
- Slow and potentially flaky
- Run before deployment
- **Examples:**
  - User signs up, creates entry, views dashboard
  - Complete AI refinement flow from start to finish

**Manual Tests**
- Exploratory testing
- UX and visual testing
- Cross-browser compatibility
- Mobile device testing

#### Testing Tools & Libraries

**Frontend:**
- **Vitest**: Test runner (fast, modern, works with Vite)
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: Mock API calls in tests
- **@testing-library/user-event**: Simulate user interactions

**Backend:**
- **Vitest**: Test runner
- **Supertest**: HTTP assertion library (test API endpoints)
- **Test database**: Separate Supabase project or local PostgreSQL
- **Mock Anthropic SDK**: Mock AI API responses for testing

**Coverage Goals:**
- **Unit tests**: 80%+ coverage for services and utilities
- **Integration tests**: Cover all API endpoints
- **E2E tests**: Cover critical user paths

#### Testing Per Phase

| Phase | Test Focus | Priority Tests |
|-------|-----------|----------------|
| **0** | Infrastructure | Test setup works, example tests pass |
| **1** | Auth flows | Auth endpoints, token validation, protected routes |
| **2** | CRUD operations | Entry creation, listing, updates, validation |
| **3** | AI integration | Mocked AI responses, conversation flow, summary parsing |
| **4** | Calculations | Dashboard stats accuracy, streak logic, aggregations |
| **5** | Full system | E2E flows, cross-browser, performance, security |

#### Continuous Testing

**During development:**
- Run unit tests in watch mode (`vitest --watch`)
- Fix failing tests before moving forward
- Write tests for bugs before fixing them (TDD for bugs)

**Before committing:**
- Run full test suite (`pnpm test`)
- Run linting (`pnpm lint`)
- Run type checking (`pnpm type-check`)

**Before deployment:**
- Run full test suite with coverage
- Run E2E tests
- Manual testing of critical paths
- Check for test flakiness

#### Test Data Management

**Test fixtures:**
- Create reusable test data (users, entries, conversations)
- Store in `tests/fixtures/` directories
- Mock AI responses in fixtures

**Database seeding:**
- Seed test database with known data
- Reset database between test runs
- Use transactions for isolated tests

**Mocking strategy:**
- Mock external APIs (Anthropic) in tests
- Don't mock internal code (test real implementations)
- Use MSW for frontend API mocking

#### Success Criteria for Testing

Before moving to next phase, ensure:
- ✅ All new tests pass
- ✅ Code coverage meets targets
- ✅ No regression in previous tests
- ✅ Manual testing checklist completed
- ✅ No known critical bugs

---

### 13.9 Phase Dependencies

```
Phase 0 (Setup)
    ↓
Phase 1 (Auth)
    ↓
Phase 2 (Basic Entries) ←────┐
    ↓                         │
    ├→ Phase 3 (AI)          │
    │                         │
    └→ Phase 4 (Dashboard)   │
         ↓          ↓         │
         └──────────┴→ Phase 5 (Polish)
```

**Critical Path:**
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 5

**Can be done in parallel:**
- Phase 3 (AI) and Phase 4 (Dashboard) after Phase 2 is complete

---

### 13.10 MVP Definition & Launch Criteria

**Minimum Viable Product (MVP) includes:**

**Core Functionality:**
- ✅ User authentication (signup, login, logout)
- ✅ Text entry creation
- ✅ AI conversation refinement (optional, user choice)
- ✅ AI summary generation with scoring
- ✅ Entry list and detail views
- ✅ Basic dashboard with stats and timeline

**Quality Requirements:**
- ✅ No critical bugs
- ✅ Auth works reliably
- ✅ AI responses are coherent and helpful
- ✅ Data persists correctly
- ✅ Mobile responsive
- ✅ Error handling in place

**Nice-to-have (can launch without):**
- Voice input (add post-launch)
- Advanced analytics (add post-launch)
- Data export (important but not day 1)

**Launch Checklist:**
- [ ] All Phase 0-3 tasks complete
- [ ] Phase 4 dashboard works
- [ ] **All automated tests passing** (unit, integration, E2E)
- [ ] **Test coverage meets targets** (80%+ for critical paths)
- [ ] **Manual testing passed** (all user flows work)
- [ ] **Security testing passed** (auth, RLS, input validation)
- [ ] **Cross-browser testing passed** (Chrome, Firefox, Safari)
- [ ] **Mobile testing passed** (iOS and Android browsers)
- [ ] Deployed to production
- [ ] Single user (you) can use daily
- [ ] No data loss issues
- [ ] No critical bugs found in testing
- [ ] Performance acceptable (< 2s page loads, < 5s AI responses)
- [ ] Error handling works gracefully

**Post-Launch Iteration:**
- Collect feedback from daily use
- Fix bugs as they appear
- Add voice input (Phase 5)
- Add analytics tracking
- Refine AI prompts based on usage
- Optimize scoring calibration

---

### 13.11 Risk Mitigation

**Technical Risks:**

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI API rate limits or costs exceed budget | High | Monitor costs daily, implement rate limiting, cache responses where possible |
| Conversation flow gets stuck or loops | Medium | Add max turn limit, allow user to skip to summary anytime |
| Database fills up quickly | Medium | Monitor storage, implement data archiving, upgrade if needed |
| Auth token issues | High | Extensive testing, implement refresh logic early, clear error messages |
| Performance issues with many entries | Medium | Optimize queries, add indexes, implement pagination everywhere |

**Product Risks:**

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI questions feel intrusive or unhelpful | High | Extensive prompt testing, allow users to skip, iterate based on feedback |
| Scoring system feels arbitrary | Medium | Clear guidance, allow adjustments, explain AI reasoning |
| User doesn't return after first use | High | Focus on frictionless UX, make value clear immediately, daily reminders (future) |
| Users don't trust AI with personal thoughts | High | Emphasize privacy, store data securely, allow raw entry save without AI |

**Mitigation Strategies:**
- Start with single user (you) to catch issues early
- Iterate on AI prompts based on real usage
- Monitor costs and usage patterns closely
- Keep scope small for MVP - add features after validation
- Regular backups of database
- Clear error messages and fallbacks

---

## Appendix: Key Design Decisions

This appendix consolidates the rationale for major architectural and product decisions made throughout the PRD. For implementation details, refer to Section 5 (Technical Architecture) and Section 13 (Implementation Plan).

### Product Design Decisions

**Two Separate AI Prompts (Section 4.2)**
- **Why:** Dedicated prompts for conversation vs. summary generation produce better quality. Easier to iterate and optimize each independently. Clear separation simplifies debugging.

**Mandatory Scoring (Section 4.3)**
- **Why:** Core to longitudinal tracking value proposition. AI suggestions reduce user burden. Future: may add "Let AI decide" option if users struggle.

**Web-First Approach (Section 8.4)**
- **Why:** No app store friction, faster iteration. Mobile-responsive covers most use cases. Easy updates and experimentation.

### Architecture Decisions

**Separate Frontend/Backend (Section 5.1)**
- **Why:** Clean separation of concerns, independent scaling. No serverless timeout limits for long AI conversations. Can swap implementations independently.

**Monorepo with pnpm Workspaces (Section 5.1)**
- **Why:** Shared types between frontend/backend for type safety. Single version control, atomic commits across packages. Efficient storage with shared `node_modules`.

**Supabase (PostgreSQL + Auth) (Section 5.3)**
- **Why:** Cost-effective free tier for MVP. Built-in auth, Row Level Security, and real-time capabilities. PostgreSQL flexibility for complex queries.

### Technology Stack Rationale

**Frontend: Vite + React (Section 5.2)**
- **Vite over Next.js:** No need for SSR, faster dev experience, lighter weight
- **React:** Industry standard, great ecosystem
- **TanStack Query:** Handles API state, caching, optimistic updates automatically
- **Zustand over Redux:** Much simpler, sufficient for client state complexity
- **Tailwind + shadcn/ui:** Rapid UI development with consistency

**Backend: Fastify (Section 5.3)**
- **Fastify over Express:** 2x faster with better async/await handling. First-class TypeScript support. Built-in schema validation.

**Shared: Zod (Section 5.3)**
- **Why:** Runtime validation + TypeScript types from single source. Shared schemas between frontend/backend. Great error messages for users.

### Code Organization Rationale

**Frontend Structure (Section 5.12.2)**
- **Why feature-based:** Related components grouped together, easier to navigate. Separated API layer and custom hooks for maintainability. Zustand for client state, TanStack Query for server state.

**Backend Structure (Section 5.12.3)**
- **Why layered:** Three layers (Routes → Services → Repositories) separate concerns. Services contain testable business logic. Repositories abstract database operations.

**Prompts as Code (Section 5.12.3)**
- **Why:** AI prompts versioned in codebase (not database). Easy to review in PRs and A/B test. No runtime database query needed.

---

**End of PRD**
