# Hospital Rio Rise - Sistema de Gestão

## Overview

Hospital Rio Rise is a role-playing game management system for a fictional hospital. The application manages covenants (insurance agreements), shifts, rules, members, and role-playing commands ("/me" commands). It features role-based access control with five user levels: Director, Vice-Director, Surgeon, Therapist, and Member. The system includes real-time countdown timers for covenant expiration and password-protected administrative actions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (no React Router)
- TanStack Query (React Query) for server state management and data fetching

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system with "new-york" style variant
- Tailwind CSS for utility-first styling with custom dark mode theme
- Class Variance Authority (CVA) for component variant management
- Carbon Design System principles adapted for medical industry aesthetics

**Design System:**
- Dark-first theme with medical blue primary color (HSL 210 90% 55%)
- Custom color palette for status indicators (active, expiring, expired)
- Inter font for UI text, JetBrains Mono for codes/timers
- Responsive design with mobile breakpoint at 768px
- Utility classes for elevation effects (hover-elevate, active-elevate-2)

**State Management:**
- React Context API for authentication state (AuthContext)
- TanStack Query for all server data with aggressive caching (staleTime: Infinity)
- Local storage for session persistence
- Form state managed by React Hook Form with Zod validation

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server
- Custom route registration system in `server/routes.ts`
- JSON-based file storage in `data/` directory (no database currently)
- Session-less authentication using access codes

**Data Storage Pattern:**
- File-based JSON storage with in-memory caching
- Abstracted storage interface (IStorage) for future database migration
- Five data files: users.json, shifts.json, covenants.json, rules.json, me-commands.json
- Manual JSON file editing for data management (documented in CONFIGURACAO.md)

**Business Logic:**
- Covenant time calculation: R$4,000 = 1 month (30 days) | R$1,000 = 7.5 days (proportional)
- Real-time countdown timers on client side
- Password validation for sensitive operations (shift-specific or admin)
- Role-based access control with six permission levels (added Administrador)

### Authentication & Authorization

**Authentication Flow:**
- Access code-based login (no traditional username/password)
- User data stored in localStorage for session persistence
- No JWT or session cookies - stateless authentication
- Login endpoint: POST /api/auth/login

**Authorization Levels:**
1. **Administrator (administrador):** Highest level access, can manage everything including other administrators
2. **Director (diretor):** Full access to all shifts and administrative functions
3. **Vice-Director (vice_diretor):** Can manage users and has full control of assigned shift
4. **Surgeon (cirurgiao):** View-only access to assigned shift
5. **Therapist (terapeuta):** View-only access to assigned shift
6. **Member (membro):** View-only access to assigned shift

**Password Protection:**
- Shift-specific passwords for editing shift content
- General admin password ("admin123") for global content
- Password modal component for sensitive operations
- Validation endpoint: POST /api/auth/validate-password

### Data Models (Zod Schemas)

**User Schema:**
- Access code for authentication
- Role-based permissions (enum)
- Optional shift assignment
- Narnia name and phone for role-play context

**Covenant Schema:**
- Organization name and payment amount
- Start/end dates with ISO 8601 timestamps
- Total seconds for countdown calculation
- Automatic expiration tracking

**Shift Schema:**
- Name and vice director assignment
- Password protection
- Associated rules and commands

**Rule Schema:**
- Title and content
- Type: "general" or "shift"
- Optional shift association
- Created/updated timestamps

**MeCommand Schema:**
- Text for role-play commands
- Type: "general" or "shift"
- Optional shift association

### API Architecture

**REST Endpoints:**
- `/api/auth/*` - Authentication and password validation
- `/api/users/*` - User management and queries
- `/api/shifts/*` - Shift management
- `/api/covenants/*` - Covenant CRUD operations
- `/api/rules/*` - Rules management with filtering
- `/api/me-commands/*` - Role-play commands management

**Query Patterns:**
- General resources: `/api/{resource}`
- Shift-filtered: `/api/{resource}/shift/{shiftId}`
- User-filtered: `/api/users/shift/{shiftId}`

**Error Handling:**
- Centralized Express error middleware
- Zod schema validation on inputs
- HTTP status codes: 400 (validation), 401 (auth), 500 (server)

## External Dependencies

### Core Runtime Dependencies

**Database & ORM:**
- Drizzle ORM (v0.39.1) for database operations
- @neondatabase/serverless (v0.10.4) for Neon Postgres connection
- drizzle-zod for schema validation integration
- PostgreSQL dialect configuration

**Frontend Libraries:**
- React 18 with TypeScript
- TanStack Query v5 for data fetching
- Wouter for routing
- React Hook Form with @hookform/resolvers for forms
- date-fns for date manipulation

**UI Component Libraries:**
- 20+ Radix UI primitives (@radix-ui/react-*)
- shadcn/ui components built on Radix
- cmdk for command palette
- embla-carousel-react for carousels
- vaul for drawer components

**Styling:**
- Tailwind CSS v3
- class-variance-authority for variants
- clsx and tailwind-merge for class composition
- PostCSS with autoprefixer

### Development Dependencies

**Build Tools:**
- Vite for development and production builds
- esbuild for server bundle
- tsx for TypeScript execution
- @vitejs/plugin-react

**Replit-Specific:**
- @replit/vite-plugin-runtime-error-modal
- @replit/vite-plugin-cartographer (dev only)
- @replit/vite-plugin-dev-banner (dev only)

**Type Definitions:**
- @types/node for Node.js types
- TypeScript configured for strict mode
- Path aliases: @/ for client, @shared/ for shared code

### Database Configuration

**Drizzle Setup:**
- Schema defined in `shared/schema.ts`
- Migrations output to `./migrations`
- PostgreSQL dialect with Neon serverless driver
- Connection via DATABASE_URL environment variable
- Push command: `npm run db:push`

**Migration Strategy:**
- Current: JSON file storage in `data/` directory
- Future: PostgreSQL via Drizzle ORM
- Schema already defined for database migration
- Storage abstraction layer for easy transition

### Session Management

**Current Implementation:**
- No session store (stateless authentication)
- connect-pg-simple installed but not used
- Ready for PostgreSQL session store when database is added

### Font Loading

**Google Fonts:**
- Inter (weights: 300, 400, 500, 600, 700)
- JetBrains Mono (weights: 400, 500, 600)
- Preconnected to fonts.googleapis.com and fonts.gstatic.com