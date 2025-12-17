# Class Quotes

## Overview

Class Quotes is a web application for collecting and displaying memorable quotes from teachers and students. Users can submit quotes, filter them by time period and role type, and browse the collection. The app includes an admin mode for managing quotes (edit/delete) protected by a simple password.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration supporting light/dark modes
- **Animations**: Framer Motion for quote card animations

### Backend Architecture
- **Framework**: Express.js running on Node.js
- **API Design**: RESTful API with JSON responses
- **Validation**: Zod schemas for request validation with drizzle-zod integration
- **Development**: Vite dev server with HMR integration for development mode

### Data Storage
- **Schema Definition**: Drizzle ORM with PostgreSQL dialect for schema definition
- **Current Storage**: JSON file-based storage (`data/quotes.json`) for persistence
- **Database Ready**: Schema configured for PostgreSQL migration when DATABASE_URL is provided
- **Data Model**: Two main entities - Users (for future auth) and Quotes (name, text, type [Teacher/Student/None], timestamp)

### Key Design Decisions

1. **Hybrid Storage Approach**: The app uses Drizzle ORM for schema definition but currently persists data to JSON files. This allows easy migration to PostgreSQL by simply providing a DATABASE_URL environment variable.

2. **Monorepo Structure**: Single repository with clear separation:
   - `client/` - React frontend application
   - `server/` - Express backend API
   - `shared/` - Shared TypeScript types and schemas

3. **Type Safety**: End-to-end type safety using TypeScript with shared schema definitions between frontend and backend via the `@shared` path alias.

4. **Simple Admin Authentication**: Password-based admin access (hardcoded "mbg") stored in client state - suitable for low-security use cases. Admins can create, edit, and delete quotes.

## External Dependencies

### Database
- PostgreSQL (via Drizzle ORM) - schema defined but requires DATABASE_URL environment variable
- Fallback to JSON file storage when database not configured

### UI Libraries
- Radix UI - accessible component primitives
- Lucide React - icon library
- Embla Carousel - carousel functionality
- date-fns - date formatting with German locale support

### Build & Development
- Vite - frontend build tool with React plugin
- esbuild - server bundling for production
- Tailwind CSS v4 - utility-first CSS framework

### Session Management
- connect-pg-simple - PostgreSQL session store (available for future session needs)
- express-session - session middleware