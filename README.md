# Sift - Daily Reflection Tool

AI-powered journaling for daily self-reflection. Write about your day, optionally engage in a guided conversation with AI to explore your thoughts deeper, and receive a structured summary with insights.

## Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0

## First-Time Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:monsur/Sift.git
   cd Sift
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   ```

   Edit `packages/backend/.env` with your credentials:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `ANTHROPIC_API_KEY` - Your Anthropic API key
   - `JWT_SECRET` - A secure random string for JWT signing

4. **Set up the database**
   - Create a [Supabase](https://supabase.com) project (free tier available)
   - Run the migrations in `packages/backend/supabase/migrations/` in order:
     1. `001_initial_schema.sql`
     2. `002_rls_policies.sql`

5. **Build the shared package**
   ```bash
   pnpm build:shared
   ```

6. **Start the development servers**
   ```bash
   pnpm dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## Common Commands

### Development

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend and backend concurrently |
| `pnpm dev:frontend` | Start frontend only |
| `pnpm dev:backend` | Start backend only |

### Building

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm build:shared` | Build shared package only |
| `pnpm build:frontend` | Build frontend for production |
| `pnpm build:backend` | Build backend for production |

### Testing

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm --filter frontend test` | Run frontend tests only |
| `pnpm --filter backend test` | Run backend tests only |
| `pnpm --filter shared test` | Run shared package tests only |

### Code Quality

| Command | Description |
|---------|-------------|
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint on all packages |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check code formatting |

### Database

| Command | Description |
|---------|-------------|
| `pnpm --filter backend test:db` | Test database connection |

### Cleanup

| Command | Description |
|---------|-------------|
| `pnpm clean` | Remove all build artifacts and node_modules |

## Project Structure

```
Sift/
├── packages/
│   ├── frontend/          # React + Vite + Tailwind CSS
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── pages/       # Page components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── stores/      # Zustand state stores
│   │   │   ├── services/    # API client services
│   │   │   └── lib/         # Utilities
│   │   └── ...
│   ├── backend/           # Fastify + TypeScript
│   │   ├── src/
│   │   │   ├── routes/      # API route handlers
│   │   │   ├── services/    # Business logic
│   │   │   ├── repositories/# Database access
│   │   │   ├── middleware/  # Fastify middleware
│   │   │   └── config/      # Configuration
│   │   └── supabase/
│   │       └── migrations/  # SQL migration files
│   └── shared/            # Shared types, schemas, constants
│       └── src/
│           ├── types/       # TypeScript interfaces
│           ├── schemas/     # Zod validation schemas
│           └── constants/   # Shared constants
├── .claude/               # Claude Code settings
├── IMPLEMENTATION.md      # Implementation plan and progress
├── PRD.md                 # Product requirements document
└── package.json           # Root workspace configuration
```

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, TanStack Query, Zustand, React Router
- **Backend:** Fastify, TypeScript, Zod
- **Database:** Supabase (PostgreSQL)
- **AI:** Anthropic Claude API
- **Testing:** Vitest, React Testing Library, Supertest

## Documentation

- [Implementation Plan](./IMPLEMENTATION.md) - Development phases and progress tracking
- [Product Requirements](./PRD.md) - Full requirements, architecture, and design decisions
