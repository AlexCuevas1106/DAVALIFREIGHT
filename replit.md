# Freight Management System

## Overview

This is a comprehensive freight management system built with React frontend, Express.js backend, and SQLite database. The application provides trucking companies with tools to manage drivers, vehicles, trailers, shipments, and compliance requirements including Hours of Service (HOS) tracking and inspection reports.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: SQLite with Drizzle ORM
- **API Pattern**: RESTful endpoints under `/api`
- **Development**: tsx for TypeScript execution in development

### Database Architecture
- **ORM**: Drizzle ORM with SQLite dialect
- **Schema Location**: `shared/schema.ts` for type sharing between frontend and backend
- **Database File**: `dev.db` (SQLite file)

## Key Components

### Core Entities
- **Drivers**: User management with CDL tracking, status management (off_duty, on_duty, driving, sleeper)
- **Vehicles**: Fleet management with maintenance tracking, fuel levels, mileage
- **Trailers**: Trailer inventory with capacity and inspection tracking
- **Shipments**: Load management with origin/destination tracking
- **Hours of Service**: DOT compliance tracking for driver work hours
- **Inspection Reports**: Vehicle and trailer inspection documentation
- **Documents**: File management for compliance documents
- **Activity Logs**: Audit trail for system activities

### UI Components
- **Dashboard**: Main overview with status cards and real-time information
- **Sidebar Navigation**: Collapsible navigation with module access
- **Status Selector**: Driver duty status management with visual indicators
- **Module Cards**: Interactive cards for different system modules
- **Expenses Report**: Comprehensive expense tracking with fuel, mileage, and miscellaneous entries

### Authentication & Authorization
- Basic role-based system with driver and admin roles
- Session-based authentication (infrastructure in place for expansion)

## Data Flow

1. **Client Requests**: React components use TanStack Query for API calls
2. **API Layer**: Express routes handle CRUD operations with validation
3. **Data Access**: Storage layer abstracts database operations using Drizzle ORM
4. **Database**: SQLite stores all application data with proper relationships
5. **Real-time Updates**: Query client handles cache invalidation and updates

## External Dependencies

### Frontend Dependencies
- **UI Framework**: @radix-ui components for accessible UI primitives
- **Form Handling**: react-hook-form with zod validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: lucide-react for consistent iconography

### Backend Dependencies
- **Database**: better-sqlite3 for SQLite operations
- **Validation**: zod for schema validation
- **Development**: tsx for TypeScript execution

### Development Tools
- **Database Management**: drizzle-kit for migrations and schema management
- **Build**: esbuild for production bundling
- **Development**: Replit-specific plugins for enhanced development experience

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` starts both frontend (Vite) and backend (Express)
- **Database**: SQLite file-based database for easy development setup
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend

### Production Deployment
- **Build Process**: `npm run build` creates optimized frontend bundle and compiles backend
- **Static Assets**: Frontend builds to `dist/public`, served by Express in production
- **Database**: Production can easily migrate to PostgreSQL using Drizzle's multi-dialect support
- **Deployment Target**: Configured for autoscale deployment on Replit

### Environment Configuration
- **Development**: NODE_ENV=development enables development features
- **Production**: NODE_ENV=production optimizes for performance
- **Database Seeding**: Automatic seed data creation on startup for development

## Changelog

- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.