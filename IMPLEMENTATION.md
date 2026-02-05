# Implementation Plan: Daily Reflection Tool

**Version:** 1.0 (MVP)
**Last Updated:** January 31, 2026
**Related:** See [PRD.md](./PRD.md) for requirements, architecture, and design decisions

---

## Overview

This document breaks down the MVP development into logical phases with clear milestones and success criteria. Phases are designed to deliver working functionality incrementally, allowing for testing and iteration along the way.

**For requirements and technical architecture, see [PRD.md](./PRD.md)**

---

## Development Phases Overview

| Phase | Focus | Key Deliverable | Dependencies |
|-------|-------|----------------|--------------|
| **0** | Project Setup | Working monorepo with tooling | None |
| **1** | Auth & Database | User can sign up/login | Phase 0 |
| **2** | Basic Entries | User can create text entries | Phase 1 |
| **3** | AI Integration | Full refinement flow works | Phase 2 |
| **4** | Dashboard | User can view history & insights | Phase 2 |
| **5** | Polish & Launch | Voice input, analytics, export | Phases 3 & 4 |

---

## Phase 0: Project Setup & Foundation

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

## Phase 1: Authentication & User Profile

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

## Phase 2: Basic Entry Creation (Text Only)

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

## Phase 3: AI Integration (Conversation & Summary)

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

## Phase 4: Dashboard & Historical Insights

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

## Phase 5: Polish & Launch Preparation

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

## Testing Strategy

Testing is integrated throughout development, not just at the end. Each phase (0-5) includes specific testing tasks to ensure quality and catch issues early. This section provides the overall testing philosophy and approach.

### Testing Philosophy

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

### Testing Levels

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

### Testing Tools & Libraries

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

### Testing Per Phase

| Phase | Test Focus | Priority Tests |
|-------|-----------|----------------|
| **0** | Infrastructure | Test setup works, example tests pass |
| **1** | Auth flows | Auth endpoints, token validation, protected routes |
| **2** | CRUD operations | Entry creation, listing, updates, validation |
| **3** | AI integration | Mocked AI responses, conversation flow, summary parsing |
| **4** | Calculations | Dashboard stats accuracy, streak logic, aggregations |
| **5** | Full system | E2E flows, cross-browser, performance, security |

### Continuous Testing

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

### Test Data Management

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

### Success Criteria for Testing

Before moving to next phase, ensure:
- ✅ All new tests pass
- ✅ Code coverage meets targets
- ✅ No regression in previous tests
- ✅ Manual testing checklist completed
- ✅ No known critical bugs

---

## Phase Dependencies

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

## MVP Definition & Launch Criteria

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

## Risk Mitigation

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
