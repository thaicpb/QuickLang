# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start Next.js development server with Turbopack
npm run build      # Build production bundle
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Database Management
```bash
# Start PostgreSQL container
docker-compose up -d

# Stop database
docker-compose down

# Remove all data
docker-compose down -v

# Access PostgreSQL CLI
docker exec -it quicklang-postgres psql -U postgres -d quicklang

# View container logs
docker-compose logs postgres
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with pg driver
- **Authentication**: NextAuth.js with Facebook OAuth support
- **Styling**: Tailwind CSS v4
- **Container**: Docker for PostgreSQL

### Core Architecture Patterns

#### Database Layer (`/lib`)
- **Connection Pool**: Managed via `lib/db.ts` using pg Pool with connection pooling
- **Data Access**: `lib/flashcards-db.ts` provides abstraction layer for all database operations
- **Auto-initialization**: Database schema automatically created on first connection via `lib/init-db.ts`

#### API Routes (`/app/api`)
- RESTful endpoints for flashcard CRUD operations
- Folder management endpoints with hierarchical structure
- NextAuth authentication endpoints
- CSV import functionality for bulk flashcard creation

#### Authentication Flow
- NextAuth.js handles authentication with JWT tokens
- Middleware (`middleware.ts`) protects dashboard routes
- Supports both custom token-based auth and NextAuth sessions
- Facebook OAuth integration ready (requires environment variables)

#### Component Structure
- Server Components by default in app directory
- Client Components explicitly marked with "use client"
- Provider pattern for session management (`components/Providers.tsx`)

### Key Features

#### Flashcard System
- Full CRUD operations with PostgreSQL persistence
- Folder-based organization with parent-child relationships
- Study mode with flip animations and review tracking
- CSV import for bulk flashcard creation
- Difficulty levels (easy, medium, hard) with visual indicators

#### Database Schema
```sql
flashcards table:
- id (SERIAL PRIMARY KEY)
- word, meaning, example (required fields)
- image_url, category, folder_id (optional)
- difficulty (enum: easy/medium/hard)
- review tracking (review_count, last_reviewed)

folders table:
- id (SERIAL PRIMARY KEY)
- name (required)
- parent_id (self-referential for hierarchy)
- card_count (auto-calculated)
```

### Environment Configuration
Required environment variables in `.env.local`:
- Database: `DB_HOST`, `DB_PORT` (5433), `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Auth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- OAuth (optional): `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`

### Development Workflow
1. Ensure Docker is running for PostgreSQL
2. Database auto-initializes with schema and sample data on first connection
3. Hot reload enabled via Next.js Turbopack
4. API routes handle all data operations through centralized database layer