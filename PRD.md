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

### 5.1 Architecture Overview

**Architecture Pattern:** Decoupled frontend/backend with separate deployment
- Frontend: Single-page application (SPA)
- Backend: REST API server
- Database: Managed PostgreSQL (Supabase)
- Deployment: Static frontend + Node.js backend

**Project Structure:** Monorepo with pnpm workspaces
```
sift/
├── packages/
│   ├── frontend/     # Vite + React SPA
│   ├── backend/      # Fastify REST API
│   └── shared/       # Shared TypeScript types
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

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

### 5.10 Architecture Rationale

**Why separate frontend/backend?**
- Clean separation of concerns
- Independent scaling
- No function timeout limits (vs serverless)
- Better for learning modern architecture
- Can swap implementations independently

**Why Vite over Next.js?**
- No need for SSR (server-side rendering)
- Faster dev experience
- More control over architecture
- Lighter weight

**Why Fastify over Express?**
- Modern, faster (~2x performance)
- First-class TypeScript support
- Built-in schema validation
- Better async/await handling

**Why monorepo?**
- Shared types between frontend/backend
- Single version control
- Atomic commits across packages
- Easier local development

**Why TanStack Query?**
- Industry standard for API state
- Handles caching, refetching automatically
- Perfect for chat interface (optimistic updates)
- Great developer experience

**Why Zustand over Redux?**
- Much simpler API
- Less boilerplate
- Sufficient for this app's complexity
- Great TypeScript support

**Why Zod?**
- Runtime validation + TypeScript types
- Single source of truth for data shapes
- Shared between frontend/backend
- Great error messages for users

---

### 5.11 API Contract

**Note:** This API contract is a starting point and will evolve as we build and learn. The PRD is a living document.

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

#### 5.11.1 Authentication Endpoints

**POST /api/auth/signup** - Register new user
```typescript
Request: {
  email: string,
  password: string
}

Response: 201 Created
{
  user: { id: string, email: string, created_at: string },
  session: { access_token: string, refresh_token: string, expires_at: number }
}
```

**POST /api/auth/login** - Login existing user
```typescript
Request: { email: string, password: string }
Response: 200 OK (same as signup)
```

**POST /api/auth/logout** - Logout current user
```typescript
Request: (empty, uses Authorization header)
Response: 200 OK { message: string }
```

**POST /api/auth/refresh** - Refresh access token
```typescript
Request: { refresh_token: string }
Response: 200 OK { access_token: string, expires_at: number }
```

---

#### 5.11.2 User Profile Endpoints

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

#### 5.11.3 Entry Endpoints

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

#### 5.11.4 AI Conversation Endpoints

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

#### 5.11.5 Summary Generation Endpoints

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

#### 5.11.6 Dashboard & Analytics Endpoints

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

#### 5.11.7 Data Export Endpoints

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

#### 5.11.8 Error Codes

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

## 6. System Prompts

### 6.1 Core Principles (Included in Both Prompts)

```
## Core Principles

**Guided, Not Asked**: Make confident decisions. The user trusts you to guide them without asking for permission.

**Balanced Perspective**: Humans catastrophize bad days and romanticize good ones. Find the nuance - acknowledge both struggles and bright spots honestly.

**Context Over Conclusions**: Initial reactions can be rash. Use conversation to see beyond "terrible day" to the fuller picture.

**Preserve Authentic Voice** (Summary only): Keep their casual tone and word choices. Polish for clarity, not perfection.

**Reflection, Not Therapy**: You're helping them understand their day, not treating or diagnosing anything. Stay focused on daily reflection.
```

### 6.2 Prompt A: Refinement Conversation

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

### 6.3 Prompt B: Summary Generation

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

### 9.3 Phase 4: Scale & Share
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

## Appendix: Key Design Decisions

### Why Two Separate AI Prompts?
- **Quality**: Summary generation is critical - dedicated prompt produces better results
- **Iteration**: Easier to tweak summary format without affecting conversation
- **Optimization**: Different temperatures and parameters for different tasks
- **Debugging**: Clear separation makes it easier to identify and fix issues

### Why Mandatory Scoring?
- Core value proposition is longitudinal tracking
- Scores enable meaningful insights and trends
- AI suggestion reduces user burden (not starting from scratch)
- Can add "Let AI decide" option if users struggle

### Why Web-First?
- Single codebase, faster iteration
- No app store friction for initial users
- Easy updates and experimentation
- Mobile-responsive covers most use cases

### Why Supabase?
- Cost-effective (free tier for MVP)
- Built-in auth and security
- PostgreSQL flexibility
- Easy to scale if needed

---

**End of PRD**
