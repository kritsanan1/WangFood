# Tourderwang - Food Delivery Application

## Overview

Tourderwang is a localized food delivery application specifically designed for Wang Sam Mo, Udonthani, Thailand. The application connects local restaurants with customers through a modern web platform that supports both English and Thai languages. The system is built as a full-stack application with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Monolith Architecture
The application follows a monolithic architecture with clear separation between client and server code:

- **Frontend**: React SPA built with Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Deployment**: Single application deployment on Replit

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: PostgreSQL with Drizzle ORM and Neon serverless
- **Authentication**: Replit Auth (OpenID Connect)
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS with custom Thai-focused design system

## Key Components

### Frontend Architecture
- **Component-based design** using React functional components
- **shadcn/ui component library** for consistent UI elements
- **Responsive design** optimized for mobile-first approach
- **Thai language support** with custom fonts (Prompt, Sarabun)
- **Custom design system** with Thai-themed colors and branding

### Backend Architecture
- **RESTful API** design with Express.js
- **Middleware-based** request processing
- **Session management** with PostgreSQL session store
- **Real-time capabilities** through database subscriptions
- **Error handling** with centralized error middleware

### Database Schema
The application uses the following core entities:
- **Users**: Customer profiles with subscription status
- **Restaurants**: Restaurant information and ratings
- **Menus**: Food items with pricing and descriptions
- **Orders**: Order management with status tracking
- **Order Items**: Individual items within orders
- **Reviews**: Customer feedback system
- **Sessions**: Authentication session storage (required for Replit Auth)

### Authentication System
- **Replit Auth integration** using OpenID Connect
- **Session-based authentication** with secure cookies
- **User profile management** with automatic user creation
- **Protected routes** requiring authentication

## Data Flow

### Order Processing Flow
1. Customer browses restaurants and menus
2. Items added to shopping cart (client-side state)
3. Order placement creates database records
4. Real-time order status updates
5. Restaurant dashboard for order management

### Authentication Flow
1. User accesses protected route
2. Redirect to Replit Auth if not authenticated
3. OAuth callback creates/updates user session
4. Client receives user data via API
5. Protected content becomes accessible

### Data Synchronization
- **TanStack Query** manages server state and caching
- **Optimistic updates** for improved user experience
- **Real-time subscriptions** for order status updates
- **Automatic refetching** on window focus and network reconnection

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection management
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Dependencies
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Production build optimization

### Replit-Specific Dependencies
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling

## Deployment Strategy

### Single Application Deployment
- **Monolithic deployment** on Replit platform
- **Production build** combines frontend and backend
- **Environment-based configuration** for development/production
- **Session storage** in PostgreSQL for scalability

### Build Process
1. **Frontend build**: Vite compiles React app to static assets
2. **Backend build**: ESBuild bundles Express server
3. **Asset serving**: Express serves static frontend files
4. **API routes**: Express handles backend API endpoints

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **REPLIT_DOMAINS**: Allowed domains for OAuth
- **NODE_ENV**: Environment specification

### File Structure
```
├── client/           # React frontend application
├── server/           # Express backend application
├── shared/           # Shared types and schemas
├── dist/             # Production build output
└── migrations/       # Database migration files
```

The application is designed for easy development on Replit with hot reloading in development and optimized production builds for deployment.