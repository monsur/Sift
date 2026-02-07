# Implementation Plan: Daily Reflection Tool

**Version:** 1.0 (MVP)
**Last Updated:** February 7, 2026
**Related:** See [PRD.md](./PRD.md) for requirements, architecture, and design decisions

---

## Current Status

**Last Updated:** 2026-02-07
**Current Phase:** Phase 3 - AI Integration
**Current Task:** Phase 3 In Progress - AI provider abstraction, services, and prompts complete; routes and UI remaining
**Overall Progress:** 3/6 phases complete (50%)

### Phase Completion Tracking

| Phase | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| **0** | ✅ Complete | 2026-02-05 | 2026-02-05 | Project setup and foundation |
| **1** | ✅ Complete | 2026-02-07 | 2026-02-07 | Auth system with email verification, password reset, rate limiting |
| **2** | ✅ Complete | 2026-02-07 | 2026-02-07 | Entry CRUD with service, routes, UI pages, tests |
| **3** | 🔄 In Progress | 2026-02-07 | - | AI provider abstraction + services complete |
| **4** | ⏳ Not Started | - | - | Blocked by Phase 3 |
| **5** | ⏳ Not Started | - | - | Blocked by Phases 3 & 4 |

**Status Legend:**
- ⏳ Not Started
- 🔄 In Progress
- ✅ Complete
- ⚠️ Blocked

### Active Blockers

None currently.

### Recent Notes

- 2026-02-07: **Phase 3 Started** - AI provider abstraction layer: `AIProvider` interface + `AnthropicProvider` + factory, conversation/summary services, prompt builders, 196 tests passing
- 2026-02-07: **Phase 2 Complete** - Entry CRUD: backend service + routes, frontend API/hooks/pages (NewEntry, EntrySaved, History, EntryDetail), UI components (Textarea, ScoreSlider, Dialog), navigation, 158 tests passing
- 2026-02-07: **Phase 1 Complete** - Full auth system: signup, login, logout, token refresh, email verification, password reset, rate limiting, account locking, protected routes, auth store, 118 tests passing
- 2026-02-05: **Phase 0 Complete** - Monorepo with frontend (Vite+React+Tailwind), backend (Fastify), shared package, testing infrastructure (Vitest), database migrations ready
- 2026-02-05: Task 0.1 complete - monorepo initialized with pnpm workspaces, ESLint flat config, Prettier
- 2026-02-04: Implementation plan separated from PRD.md for better tracking

---

## How to Use This Document

**Starting a new phase:**
1. Merge the completed previous phase branch into `main` (if not already merged)
   ```bash
   git checkout main
   git merge Phase01    # merge completed phase into main
   git push
   ```
2. Create a new branch named `PhaseXX` from **updated `main`**
   ```bash
   git checkout main
   git checkout -b Phase02
   ```
3. Update "Current Status" section above with phase and task
4. Change phase status to 🔄 In Progress
5. Ask Claude: "Let's implement Phase X, task X.X from IMPLEMENTATION.md"

**During implementation:**
- Check off completed tasks using `- [x]` syntax
- Add validation commands to verify each step
- Update "Recent Notes" with important decisions

**After completing each step (standard workflow):**

1. **Write tests** for new functionality (unit tests, integration tests as appropriate)
2. **Run all checks:**
   ```bash
   pnpm test        # Run tests (should include new tests)
   pnpm type-check  # Ensure no TypeScript errors
   pnpm lint        # Ensure code style consistency
   ```
3. **Update IMPLEMENTATION.md** - Check off completed tasks, add notes
4. **Commit and push** — keep commits small and logically cohesive (not one big commit per phase):
   ```bash
   git add <specific files>
   git commit -m "Brief description of the change"
   git push
   ```

**Completing a phase:**
- Mark phase status as ✅ Complete
- Add completion date
- Update "Current Task" to next phase
- Run full verification before moving on
- **Update MEMORY.md** with any learnings, gotchas, or patterns discovered during the phase (these persist across Claude Code sessions)

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
- [x] Create root `package.json` with workspace scripts
- [x] Set up `pnpm-workspace.yaml`
- [x] Configure root ESLint and Prettier
- [x] Create `.gitignore`

**Validation:**
```bash
# Verify workspace structure
ls -la | grep package.json
ls -la | grep pnpm-workspace.yaml
pnpm -v  # Should show pnpm version
```

**0.2 Set Up Frontend Package**
- [x] Initialize Vite + React + TypeScript project
- [x] Install dependencies: React Router, TanStack Query, Zustand, Axios
- [x] Install Tailwind CSS and configure
- [x] Set up shadcn/ui (copy base components)
- [x] Create basic folder structure (src/components, src/pages, etc.)
- [x] Configure `vite.config.ts` with proper aliases

**Validation:**
```bash
cd packages/frontend
pnpm dev  # Should start Vite dev server on port 5173
# In another terminal:
curl http://localhost:5173  # Should return HTML
```

**0.3 Set Up Backend Package**
- [x] Initialize Node.js + TypeScript project
- [x] Install dependencies: Fastify, Supabase client, Anthropic SDK, Zod
- [x] Create folder structure (src/routes, src/services, etc.)
- [x] Configure `tsconfig.json` with strict settings
- [x] Set up `app.ts` and `server.ts` entry points
- [x] Configure environment variables with `.env.example`

**Validation:**
```bash
cd packages/backend
pnpm dev  # Should start backend server on port 3000
# In another terminal:
curl http://localhost:3000/health  # Should return health check response
```

**0.4 Set Up Shared Package**
- [x] Initialize TypeScript package
- [x] Create folder structure (src/types, src/schemas, src/constants)
- [x] Set up barrel exports in `index.ts`
- [x] Configure `tsconfig.json` for library compilation

**Validation:**
```bash
cd packages/shared
pnpm build  # Should compile TypeScript successfully
ls dist/    # Should show compiled output
```

**0.5 Database Setup**
- [x] Create Supabase project (free tier)
- [x] Run initial migration (user_profiles, entries, analytics tables)
- [x] Set up Row Level Security (RLS) policies
- [x] Create seed data for development - Seed file created
- [x] Test database connection from backend

**Validation:**
```bash
# Test database connection
cd packages/backend
pnpm test:db  # Should connect successfully
# Or manually test with a simple query script
```

**0.6 Development Workflow**
- [x] Configure root `dev` script to run frontend + backend concurrently
- [x] Set up hot reload for both frontend and backend
- [x] Test type sharing between packages
- [x] Verify imports work correctly (shared → frontend/backend)

**Validation:**
```bash
# From project root
pnpm dev  # Should start both frontend and backend
# Frontend should be on http://localhost:5173
# Backend should be on http://localhost:3000
# Make a change to shared types and verify both rebuild
```

**0.7 Testing Infrastructure Setup**
- [x] Install testing dependencies (Vitest for both frontend/backend)
- [x] Configure Vitest for frontend with React Testing Library
- [x] Configure Vitest for backend with supertest for API testing
- [x] Set up test scripts in root `package.json`
- [x] Create example test files to verify setup works
- [x] Configure code coverage reporting
- [x] Add `test` and `test:coverage` scripts to workspace

**Validation:**
```bash
# Run tests for all packages
pnpm test
# Run tests with coverage
pnpm test:coverage
# Verify example tests pass
```

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
- [x] Implement `POST /api/auth/signup` (uses Supabase Auth)
  - [x] Enforce strong password requirements (12+ chars, mixed case, numbers, symbols)
  - [x] Validate password strength server-side
  - [x] Send verification email
  - [x] Mark email_verified as false
- [x] Implement `POST /api/auth/login`
  - [x] Check email_verified status
  - [x] Implement rate limiting (max 5 attempts per 15 min)
  - [x] Track failed login attempts
  - [x] Lock account for 15 min after 5 failed attempts
  - [x] Update last_login_at and login_count on success
- [x] Implement `POST /api/auth/logout`
  - [x] Invalidate refresh token
  - [x] Clear session from database
- [x] Implement `POST /api/auth/refresh`
  - [x] Rotate refresh tokens for security
- [x] Create auth middleware for JWT validation
- [x] Add comprehensive error handling for auth failures

**Validation:**
```bash
# Test signup endpoint
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# Run auth endpoint tests
pnpm --filter backend test auth
```

**1.2 Backend: Email Verification**
- [x] Implement `POST /api/auth/verify-email`
  - [x] Validate verification token
  - [x] Mark email_verified as true
  - [x] Set email_verified_at timestamp
  - [x] Return error for invalid/expired/used tokens
- [x] Implement `POST /api/auth/resend-verification`
  - [x] Send new verification email
  - [x] Rate limit: max 3 per hour per email
- [x] Configure email templates for verification
- [x] Set verification token expiration (24 hours)

**Validation:**
```bash
# Check email logs (development mode)
# Verify email template renders correctly
# Test token expiration logic
pnpm --filter backend test email-verification
```

**1.3 Backend: Password Reset Flow**
- [x] Implement `POST /api/auth/forgot-password`
  - [x] Generate password reset token
  - [x] Send reset email
  - [x] Always return success (prevent email enumeration)
  - [x] Rate limit: max 3 per hour per email
  - [x] Token expires in 1 hour
- [x] Implement `POST /api/auth/reset-password`
  - [x] Validate reset token
  - [x] Check new password meets requirements
  - [x] Ensure new password differs from old
  - [x] Invalidate all existing sessions
- [x] Implement `POST /api/auth/change-password` (authenticated)
  - [x] Verify current password
  - [x] Validate new password requirements
  - [x] Prevent password reuse

**Validation:**
```bash
# Test password reset flow
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Run password reset tests
pnpm --filter backend test password-reset
```

**1.4 Backend: Security Features**
- [x] Implement rate limiting middleware
  - [x] Login attempts: 5 per 15 minutes per email
  - [x] Verification emails: 3 per hour per email
  - [x] Password reset: 3 per hour per email
- [x] Add account locking mechanism
  - [x] Lock after 5 failed login attempts
  - [x] Auto-unlock after 15 minutes
  - [x] Store locked_until timestamp
- [x] Update user_profiles table with security fields
  - [x] email_verified, email_verified_at
  - [x] failed_login_attempts
  - [x] locked_until

**Validation:**
```bash
# Test rate limiting (should fail on 6th attempt)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# Run security tests
pnpm --filter backend test security
```

**1.5 Backend: Profile Endpoints**
- [x] Implement `GET /api/profile`
  - [x] Return email_verified status
- [x] Implement `PATCH /api/profile`
  - [x] Update settings only (not email/password)
- [x] Create user profile on signup (database trigger or service)
  - [x] Initialize default settings (theme, default_refine_enabled)
  - [x] Set email_verified to false

**Validation:**
```bash
# Test profile endpoints (with valid JWT)
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Run profile tests
pnpm --filter backend test profile
```

**1.6 Shared: Auth Types & Schemas**
- [x] Define `User`, `UserProfile`, `UserSettings` types
- [x] Create Zod schemas for signup/login requests
  - [x] Password schema: min 12 chars, mixed case, numbers, symbols
  - [x] Email validation schema
- [x] Define auth response types (tokens, user data, email_verified)
- [x] Create error response types for auth failures

**Validation:**
```bash
# Build shared package
pnpm --filter shared build

# Verify types are exported correctly
cd packages/shared && ls dist/types/

# Run schema validation tests
pnpm --filter shared test
```

**1.7 Frontend: Auth Pages - Signup & Login**
- [x] Create `SignupPage.tsx` with form
  - [x] Email and password fields
  - [x] Password strength indicator (show requirements)
  - [x] Real-time validation feedback
  - [x] Show success message about verification email
- [x] Create `LoginPage.tsx` with form
  - [x] Email and password fields
  - [x] "Forgot password?" link
  - [x] Handle "email not verified" error with resend option
  - [x] Show error for locked accounts with time remaining
- [x] Add client-side validation (Zod schemas)
- [x] Style with Tailwind + shadcn/ui components

**Validation:**
```bash
# Start frontend dev server
cd packages/frontend && pnpm dev

# Navigate to http://localhost:5173/signup
# Navigate to http://localhost:5173/login
# Test form validation with invalid inputs
# Run frontend component tests
pnpm --filter frontend test auth-pages
```

**1.8 Frontend: Email Verification Flow**
- [x] Create `VerifyEmailPage.tsx`
  - [x] Extract token from URL query param
  - [x] Auto-verify on page load
  - [x] Show success/error messages
  - [x] Redirect to login on success
- [x] Create "Email Sent" confirmation page
  - [x] Show after signup
  - [x] Include resend verification button
  - [x] Clear instructions to check inbox/spam

**Validation:**
```bash
# Test verification page loads
# http://localhost:5173/verify-email?token=test-token

# Run verification flow tests
pnpm --filter frontend test verification
```

**1.9 Frontend: Password Reset Flow**
- [x] Create `ForgotPasswordPage.tsx`
  - [x] Email input field
  - [x] Submit button
  - [x] Show "email sent" message on success
- [x] Create `ResetPasswordPage.tsx`
  - [x] Extract token from URL query param
  - [x] New password field with strength indicator
  - [x] Confirm password field
  - [x] Submit button
  - [x] Show success message and redirect to login
- [x] Handle token expiration errors gracefully

**Validation:**
```bash
# Test password reset pages
# http://localhost:5173/forgot-password
# http://localhost:5173/reset-password?token=test-token

# Run password reset flow tests
pnpm --filter frontend test password-reset
```

**1.10 Frontend: Auth State Management**
- [x] Create `authStore.ts` (Zustand) for tokens and user
  - [x] Store email_verified status
  - [x] Track authentication state
- [x] Create `useAuth.ts` hook
  - [x] signup, login, logout methods
  - [x] verifyEmail, resendVerification methods
  - [x] forgotPassword, resetPassword methods
  - [x] changePassword method
- [x] Implement token persistence (localStorage)
- [x] Implement automatic token refresh
- [x] Create axios interceptor for adding auth headers
- [x] Handle 403 errors (email not verified)

**Validation:**
```bash
# Run state management tests
pnpm --filter frontend test auth-store
pnpm --filter frontend test useAuth

# Verify localStorage persistence
# Check token refresh works (use browser dev tools)
```

**1.11 Frontend: Protected Routes**
- [x] Create `ProtectedRoute.tsx` component
  - [x] Check for valid token
  - [x] Check email_verified status
  - [x] Redirect to login if not authenticated
  - [x] Redirect to "verify email" if not verified
- [x] Wrap authenticated routes with protection
- [x] Create basic `Layout.tsx` with header
- [x] Add "Resend verification" banner if not verified

**Validation:**
```bash
# Test protected routes redirect when not authenticated
# Try accessing /dashboard without login
# Verify redirect works correctly

# Run protected route tests
pnpm --filter frontend test protected-routes
```

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
- [x] Define `Entry`, `EntryCreate`, `EntryUpdate` types
- [x] Create Zod schemas for entry validation
- [x] Define entry list response types (with pagination)

**Validation:**
```bash
pnpm --filter shared build
pnpm --filter shared test
```

**2.2 Backend: Entry Endpoints**
- [x] Implement `POST /api/entries` (create entry)
- [x] Implement `GET /api/entries` (list with pagination)
- [x] Implement `GET /api/entries/:id` (get single entry)
- [x] Implement `PATCH /api/entries/:id` (update score)
- [x] Implement `DELETE /api/entries/:id`
- [x] Create entry repository with database operations
- [x] Create entry service with business logic

**Validation:**
```bash
# Test entry CRUD endpoints
curl -X POST http://localhost:3000/api/entries \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"raw_entry":"Test entry","score":7}'

curl http://localhost:3000/api/entries \
  -H "Authorization: Bearer YOUR_TOKEN"

# Run backend tests
pnpm --filter backend test entries
```

**2.3 Frontend: Entry Creation UI**
- [x] Create `NewEntryPage.tsx`
- [x] Create `EntryForm.tsx` component (textarea for entry)
- [x] Create `ScoreSlider.tsx` component (1-10 slider with labels)
- [x] Add "Save" button (no "Refine" yet)
- [x] Show loading state during save
- [x] Redirect to entry detail or list after save

**Validation:**
```bash
# Test in browser: http://localhost:5173/new-entry
# Create an entry and verify it saves
pnpm --filter frontend test entry-form
```

**2.4 Frontend: Entry State Management**
- [x] Create `useEntries.ts` hook with TanStack Query
- [x] Implement mutations for create/update/delete
- [x] Implement queries for list and single entry
- [x] Configure cache invalidation on mutations

**Validation:**
```bash
pnpm --filter frontend test useEntries
# Verify cache updates after creating/deleting entries
```

**2.5 Frontend: Entry List & Detail**
- [x] Create `HistoryPage.tsx` with entry list
- [x] Create `EntryCard.tsx` component (shows TLDR, score, date)
- [x] Create `EntryDetailPage.tsx` (shows full entry)
- [x] Add pagination controls to list
- [x] Add delete confirmation dialog

**Validation:**
```bash
# Test in browser: http://localhost:5173/history
# Create 20+ entries and test pagination
pnpm --filter frontend test history-page
```

**2.6 Entry Date Handling**
- [x] Default entry_date to today
- [x] Allow user to change date (date picker)
- [x] Handle "entry already exists for date" in UI (soft check)
- [x] Show warning if user tries to create duplicate

**Validation:**
```bash
# Test date picker works
# Try creating duplicate entry for same date
pnpm --filter frontend test date-handling
```

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

## Phase 3: AI Integration (Conversation & Summary) ✅

**Goal:** Complete AI refinement flow - conversation, summary generation, scoring

**Status: COMPLETE**

**Key Deliverables:**
- ✅ "Refine" button starts AI conversation
- ✅ Multi-turn conversation works
- ✅ AI generates summary with score
- ✅ User can accept or adjust score
- ✅ Crisis detection with resource banner
- ✅ AI provider abstraction layer for swappable providers

**Tasks:**

**3.1 Backend: AI Provider Abstraction & Services**
- [x] Configure Anthropic SDK (already installed, `@anthropic-ai/sdk`)
- [x] Create `AIProvider` interface (`services/ai/ai-provider.ts`) with `complete()` and `estimateCost()`
- [x] Implement `AnthropicProvider` (`services/ai/anthropic-provider.ts`) — wraps Claude SDK, maps errors to `AppError`
- [x] Create provider factory (`services/ai/ai-provider-factory.ts`) — lazy singleton, resolves from `AI_PROVIDER` env var
- [x] Add `AI_PROVIDER` to env schema (`config/env.ts`)
- [x] Create barrel exports (`services/ai/index.ts`)
- [x] Implement error mapping (rate limit → 429, auth → 500, other → 502)
- [x] Add cost estimation (Claude Sonnet pricing)

**Validation:**
```bash
pnpm --filter backend test src/services/ai/
```

**3.2 Backend: Prompt Builders**
- [x] Create `prompts/conversation.prompt.ts` — builds system prompt with DONE_ASKING_QUESTIONS signal and recent entry context
- [x] Create `prompts/summary.prompt.ts` — builds system prompt with structured JSON output instructions

**Validation:**
```bash
pnpm --filter backend test src/prompts/
```

**3.3 Backend: Conversation Service**
- [x] Create `conversation.service.ts` with `startConversation()` and `continueConversation()`
- [x] Detect "DONE_ASKING_QUESTIONS" signal in AI response
- [x] Enforce `MAX_CONVERSATION_TURNS` guard (returns done when limit reached)
- [x] Implement `POST /api/conversation/start` endpoint
- [x] Implement `POST /api/conversation/message` endpoint
- [x] Store conversation transcript in entry on completion

**Validation:**
```bash
pnpm --filter backend test conversation
```

**3.4 Backend: Summary Service**
- [x] Create `summary.service.ts` with `generateSummary()` and `estimateTotalCost()`
- [x] Parse structured JSON response, validate required fields
- [x] Clamp AI-suggested score to 1-10 range
- [x] Implement `POST /api/summary/generate` endpoint
- [x] Implement `POST /api/summary/finalize` endpoint
- [x] Update entry with refined data on finalize

**Validation:**
```bash
pnpm --filter backend test summary
```

**3.5 Shared: AI Types & Constants**
- [x] Define `AIMessage` type (provider-level, no timestamp)
- [x] Define `AITokenUsage`, `AIConversationTurnResult` types
- [x] Define `AISummaryResult`, `AISummaryGenerationResult` types
- [x] Add `AI_PROVIDERS` array, `AIProviderName` type, `DEFAULT_AI_PROVIDER`
- [x] Add temperature and max token constants
- [x] `ConversationMessage` type already existed (with timestamp, for storage)

**Validation:**
```bash
pnpm --filter shared build && pnpm --filter shared test
```

**3.6 Frontend: Chat Interface**
- [x] Create `ChatInterface.tsx` component
- [x] Create `ChatMessage.tsx` component (user vs AI styling)
- [x] Create `ChatInput.tsx` component
- [x] Add "Refine with AI" button to entry form
- [x] RefinePage with conversation → generating → review phases

**Validation:**
```bash
# Test chat UI in browser
pnpm --filter frontend test chat-interface
```

**3.7 Frontend: Conversation State**
- [x] Create `useConversation.ts` hook (useStartConversation, useSendMessage, useGenerateSummary, useFinalizeSummary)
- [x] Create conversation and summary API clients
- [x] Handle conversation flow (start → messages → complete)
- [x] Store messages locally in RefinePage state
- [x] Handle "End conversation & summarize" action

**Validation:**
```bash
pnpm --filter frontend test conversation-state
# Verify state persists during conversation
```

**3.8 Frontend: Summary Display**
- [x] Display AI-generated summary (narrative, key moments, TLDR)
- [x] Show AI suggested score with explanation
- [x] Allow user to adjust score with ScoreSlider
- [x] Allow user to adjust justification
- [x] Finalize saves refined entry data

**Validation:**
```bash
# Create entry with refinement and verify summary displays
pnpm --filter frontend test summary-display
```

**3.9 Context Service**
- [x] Implement `context.service.ts` to retrieve recent entries
- [x] Load last 14 days of entries (CONTEXT_DAYS constant)
- [x] Format for AI context (only relevant fields)
- [x] Returns Entry[] for prompt builders to format

**Validation:**
```bash
pnpm --filter backend test context-service
# Verify correct entries are loaded for context
```

**3.10 Crisis Detection**
- [x] Implement client-side keyword detection in entries and conversation
- [x] Show crisis resources banner (988, Crisis Text Line, 911)
- [x] Allow user to continue or exit to dashboard
- [x] Integrated into EntryForm and RefinePage

**Validation:**
```bash
# Test with concerning keywords
pnpm --filter backend test crisis-detection
```

**3.11 Testing: AI Integration**
- **Backend Tests:**
  - **AI Provider Tests (done):**
    - ✅ Mock Anthropic SDK, test request/response mapping
    - ✅ Test error mapping (rate limit → 429, auth → 500, generic → 502)
    - ✅ Test cost estimation calculation
    - ✅ Test factory default provider selection and caching
    - ✅ Test factory rejects unimplemented providers
  - **AI Service Tests (done):**
    - ✅ Mock provider for conversation: test turn flow, done detection, max turns guard
    - ✅ Mock provider for summary: test JSON parsing, field validation, score clamping
    - ✅ Test malformed response handling
    - ✅ Test cost estimation delegation
  - **Prompt Builder Tests (done):**
    - ✅ Test conversation prompt includes DONE signal instructions and recent entry context
    - ✅ Test summary prompt includes JSON output format and score range
  - **Route Integration Tests (done):**
    - ✅ Test `POST /api/conversation/start` endpoint
    - ✅ Test `POST /api/conversation/message` endpoint
    - ✅ Test `POST /api/summary/generate` endpoint
    - ✅ Test `POST /api/summary/finalize` endpoint
    - ✅ Test validation errors for missing fields
  - **Context Service Tests (done):**
    - ✅ Test retrieving last 14 days of entries
    - ✅ Test returns empty array on error
  - **Crisis Detection Tests (done):**
    - ✅ Test keyword detection triggers correctly
    - ✅ Test no false positives for normal text
    - ✅ Test case insensitivity
    - ✅ Test detection within longer text
- **Frontend Tests (done):**
  - ✅ Unit test `useConversation` hooks (start, send, generate, finalize)
  - ✅ Test ChatInterface renders messages, loading, input visibility
  - ✅ Test ChatInterface sends messages on submit
  - ✅ Test CrisisBanner renders resources and action buttons
  - ✅ Test RefinePage renders and starts conversation
  - ✅ Test crisis detection utility function
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
- [ ] Implement `GET /api/dashboard/stats` endpoint
- [ ] Calculate aggregates (averages, min/max, distribution)
- [ ] Calculate streaks (current, longest)
- [ ] Implement score trend analysis (improving/declining/stable)
- [ ] Implement `GET /api/dashboard/timeline` endpoint
- [ ] Generate timeline data for graphing

**Validation:**
```bash
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
pnpm --filter backend test dashboard
```

**4.2 Backend: Stats Caching**
- [ ] Update user_profiles cached stats on entry creation
- [ ] Recalculate averages (7-day, 30-day, all-time)
- [ ] Update streak counts
- [ ] Optimize queries for large datasets

**Validation:**
```bash
# Create an entry and verify stats update
pnpm --filter backend test stats-caching
```

**4.3 Frontend: Dashboard Page**
- [ ] Create `DashboardPage.tsx`
- [ ] Create `StatsCard.tsx` component (total entries, streak, averages)
- [ ] Create `ScoreChart.tsx` component (line chart of scores over time)
- [ ] Create `RecentEntries.tsx` component (last 5-10 entries)
- [ ] Add "Write Today's Entry" CTA button

**Validation:**
```bash
# Visit http://localhost:5173/dashboard
# Verify all stats display correctly
pnpm --filter frontend test dashboard
```

**4.4 Frontend: Chart Library**
- [ ] Choose and install chart library (Chart.js, Recharts, or similar)
- [ ] Create reusable chart wrapper component
- [ ] Style charts to match app design
- [ ] Add responsive behavior for mobile

**Validation:**
```bash
# Test chart renders with data
# Test responsiveness on mobile viewport
```

**4.5 Frontend: History Filtering**
- [ ] Add date range filter to `HistoryPage.tsx`
- [ ] Add sorting options (date, score)
- [ ] Add search by content (optional for MVP)
- [ ] Update API calls to use filters

**Validation:**
```bash
# Test filtering and sorting work
pnpm --filter frontend test history-filtering
```

**4.6 Frontend: Entry Detail Enhancements**
- [ ] Show relative score context ("above your 30-day average")
- [ ] Display cost data (for debugging)
- [ ] Show AI model used
- [ ] Link to previous/next entry

**Validation:**
```bash
# View entry detail page and verify enhancements
```

**4.7 User Profile Settings**
- [ ] Create `SettingsPage.tsx`
- [ ] Add theme toggle (light/dark/system)
- [ ] Add default_refine_enabled toggle
- [ ] Save settings via `PATCH /api/profile`

**Validation:**
```bash
# Test settings persist after page reload
pnpm --filter frontend test settings
```

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
- [ ] Implement `useVoiceInput.ts` hook with Web Speech API
- [ ] Add voice recording button to entry form
- [ ] Show recording indicator while active
- [ ] Display transcription in real-time or after completion
- [ ] Allow user to edit transcription
- [ ] Store voice metadata (duration, input method)

**Validation:**
```bash
# Test voice input on Chrome, Safari, Edge
# Verify transcription works
pnpm --filter frontend test voice-input
```

**5.2 Analytics Implementation**
- [ ] Implement `POST /api/analytics/events` endpoint (batch)
- [ ] Create `analytics.ts` helper on frontend
- [ ] Add analytics calls for key events:
  - [ ] Page views
  - [ ] Entry creation (started, saved, refined)
  - [ ] Conversation interactions
  - [ ] Score adjustments
  - [ ] Settings changes
- [ ] Batch events and send periodically

**Validation:**
```bash
# Verify events are logged correctly
pnpm --filter backend test analytics
# Check database for analytics records
```

**5.3 Data Export**
- [ ] Implement `GET /api/export/entries` (JSON and CSV)
- [ ] Create export UI in settings
- [ ] Add "Download my data" button
- [ ] Format CSV with readable columns
- [ ] Implement `DELETE /api/export/delete-all`
- [ ] Add confirmation dialog for delete all

**Validation:**
```bash
# Test export downloads correctly
curl http://localhost:3000/api/export/entries \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: text/csv"
pnpm --filter backend test export
```

**5.4 Error Handling & UX**
- [ ] Add global error boundary on frontend
- [ ] Improve error messages (user-friendly)
- [ ] Add loading states to all async operations
- [ ] Add empty states (no entries yet, etc.)
- [ ] Add success toasts for actions
- [ ] Handle offline state gracefully

**Validation:**
```bash
# Test error scenarios
# Verify loading states show
# Test offline mode
pnpm --filter frontend test error-handling
```

**5.5 Mobile Responsiveness**
- [ ] Test all pages on mobile viewport
- [ ] Fix any layout issues
- [ ] Ensure chat interface works on mobile
- [ ] Test touch interactions
- [ ] Optimize for smaller screens

**Validation:**
```bash
# Use browser dev tools mobile viewport
# Test on real mobile device
# Chrome DevTools responsive mode
```

**5.6 Performance Optimization**
- [ ] Lazy load pages (React.lazy)
- [ ] Optimize images (if any)
- [ ] Minimize bundle size
- [ ] Add loading skeletons
- [ ] Test API response times

**Validation:**
```bash
pnpm --filter frontend build
# Check bundle size
pnpm --filter frontend analyze
# Run Lighthouse audit
```

**5.7 Security Audit**
- [ ] Review all API endpoints for auth requirements
- [ ] Ensure RLS policies cover all tables
- [ ] Test JWT expiration and refresh
- [ ] Validate all user inputs (Zod schemas)
- [ ] Review environment variable handling
- [ ] Test rate limiting

**Validation:**
```bash
# Run security tests
pnpm test:security
# Check for common vulnerabilities
```

**5.8 Documentation**
- [ ] Update README with setup instructions
- [ ] Document environment variables
- [ ] Add API documentation (Swagger)
- [ ] Write contribution guidelines (if open source)
- [ ] Document deployment process

**Validation:**
```bash
# Follow README from scratch to verify completeness
# Check all env vars are documented
```

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
