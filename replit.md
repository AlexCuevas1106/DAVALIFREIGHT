# Fleet Management System

## Overview

This is a comprehensive fleet management system designed for trucking companies to manage drivers, vehicles, trailers, shipments, and compliance requirements. The application provides a modern web interface for tracking hours of service, conducting inspections, managing expenses, and monitoring fleet operations in real-time.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query for server state management
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with Express routes
- **Validation**: Zod for runtime type validation
- **Session Management**: Express sessions with PostgreSQL store

### Development Setup
- **Environment**: Replit with Node.js 20, PostgreSQL 16
- **Hot Reload**: Development server with HMR support
- **Type Safety**: Full TypeScript coverage across client and server

## Key Components

### Database Schema
The system manages several core entities:
- **Drivers**: User accounts, licensing, status tracking, hours of service
- **Vehicles**: Fleet inventory, maintenance tracking, fuel monitoring
- **Trailers**: Trailer assignments, inspections, capacity management
- **Shipments**: Load tracking, route management, delivery status
- **Hours of Service**: DOT compliance tracking for driver work hours
- **Inspection Reports**: Vehicle and trailer safety inspections
- **Documents**: Digital document storage and management
- **Activity Logs**: Comprehensive audit trail for all system actions

### Authentication & Authorization
- Role-based access control (drivers, dispatchers, administrators)
- Session-based authentication with secure cookie storage
- Driver status management (off_duty, on_duty, driving, sleeper)

### UI/UX Design
- Responsive design optimized for desktop and mobile devices
- Dashboard with real-time status indicators and key metrics
- Modular card-based interface for different functional areas
- Dark/light theme support with CSS custom properties
- Accessibility features following WCAG guidelines

## Data Flow

### Client-Server Communication
1. **Frontend**: React components make API requests through React Query
2. **API Layer**: Express routes handle HTTP requests with validation
3. **Data Layer**: Drizzle ORM manages database operations
4. **Storage**: PostgreSQL stores all application data
5. **Real-time Updates**: Client polling for status changes and notifications

### Key User Flows
- **Driver Login**: Authentication → Dashboard → Status Selection
- **Expense Reporting**: Form Entry → Receipt Upload → Approval Workflow
- **Inspection Process**: Checklist Completion → Photo Capture → Report Generation
- **Shipment Tracking**: Assignment → Route Monitoring → Delivery Confirmation

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development and deployment platform

### Frontend Libraries
- **React Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Date-fns**: Date manipulation and formatting

### Backend Libraries
- **Drizzle ORM**: Type-safe database operations
- **Express**: Web application framework
- **Zod**: Runtime type validation
- **Connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Platform**: Replit with automatic environment provisioning
- **Database**: Automatically provisioned PostgreSQL instance
- **Hot Reload**: Vite development server with HMR
- **Port Configuration**: Application runs on port 5000

### Production Build
- **Frontend**: Vite production build with asset optimization
- **Backend**: ESBuild compilation for Node.js deployment
- **Database**: Drizzle migrations for schema management
- **Deployment**: Replit autoscale deployment target

### Environment Configuration
- Database connection through `DATABASE_URL` environment variable
- Automatic SSL/TLS handling for secure connections
- Session secret management for authentication security

## Recent Changes

```
Changelog:
- June 24, 2025. Initial setup
- June 24, 2025. Added expenses report page with fuel tracking, mileage log, and PDF generation
- June 24, 2025. Implemented document management system with Bill of Lading uploads
- June 24, 2025. Added automatic file storage by driver with base64 encoding
- June 24, 2025. Integrated fuel receipt uploads from expenses report
- June 26, 2025. Implemented role-based access control system (admin vs driver)
- June 26, 2025. Added route planning system with origin/destination selection
- June 26, 2025. Created interactive route management with distance calculation
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Access control requirements: 
- Admin users can access all features
- Regular users (drivers) limited to expenses reports, Bill of Lading uploads, and route planning
- English language interface preferred
```