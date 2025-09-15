# Overview

This is a React-based execution management interface featuring a sophisticated filter system and data visualization dashboard. The application provides users with advanced filtering capabilities, customizable table views, and real-time data management for execution monitoring. Built with modern web technologies, it emphasizes dark mode design patterns and accessibility, following a system-based design approach for productivity-focused interfaces.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**React with TypeScript**: The application uses React 18+ with TypeScript for type safety and modern component patterns. The component architecture follows a modular approach with clear separation of concerns between UI components, business logic, and data management.

**Component Structure**: Built around shadcn/ui components with custom extensions for specialized functionality. Core components include FilterInterface, ExecutionsTable, and various filter management components that work together to provide a cohesive user experience.

**State Management**: Utilizes React's built-in state management with hooks, complemented by TanStack Query for server state management and caching. This approach provides efficient data fetching, background updates, and optimistic updates.

**Routing**: Implements wouter for lightweight client-side routing, providing a minimal routing solution without the overhead of larger routing libraries.

## Styling and Design System

**Tailwind CSS**: Comprehensive utility-first CSS framework configuration with custom design tokens for consistent spacing, colors, and typography. The design system emphasizes dark mode with carefully crafted color palettes for data-heavy interfaces.

**shadcn/ui Integration**: Fully integrated component library providing accessible, customizable UI primitives. Components are styled with CSS variables for easy theming and customization.

**Design Tokens**: Custom CSS variables system supporting light/dark modes with computed border colors and elevation states for interactive elements.

## Build and Development

**Vite**: Modern build tool providing fast development server, hot module replacement, and optimized production builds. Configuration includes React plugin and custom path aliases for clean imports.

**TypeScript Configuration**: Strict TypeScript setup with path mapping for clean imports and comprehensive type checking across client, server, and shared code.

## Backend Architecture

**Express.js Server**: Node.js server using Express with TypeScript for API endpoints and static file serving. The server is configured for both development and production environments.

**Development Integration**: Vite middleware integration for seamless development experience with hot reloading and error overlays.

**Storage Interface**: Abstracted storage layer with in-memory implementation for development, designed to be easily replaceable with database implementations.

## Data Layer

**Drizzle ORM**: Type-safe SQL query builder configured for PostgreSQL with schema definitions in TypeScript. Provides compile-time safety and excellent developer experience.

**Database Schema**: PostgreSQL schema with user management tables, designed for extensibility with additional execution-related tables.

**Migration System**: Drizzle Kit configuration for database migrations and schema management.

# External Dependencies

## Core Framework Dependencies

- **React Ecosystem**: React 18+ with react-dom for component rendering and DOM manipulation
- **TypeScript**: Full TypeScript integration across the entire codebase for type safety
- **Vite**: Build tool and development server with React plugin support

## UI and Styling

- **Tailwind CSS**: Utility-first CSS framework with PostCSS for processing
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives including dialogs, dropdowns, form controls, and navigation components
- **Lucide React**: Icon library providing consistent iconography throughout the interface
- **class-variance-authority & clsx**: Utility libraries for conditional CSS class management

## Data Management

- **TanStack React Query**: Server state management library for data fetching, caching, and synchronization
- **React Hook Form**: Form state management with validation support
- **Hookform Resolvers**: Integration layer for form validation libraries

## Database and ORM

- **Drizzle ORM**: Type-safe SQL query builder and ORM for PostgreSQL
- **Drizzle Zod**: Schema validation integration between Drizzle and Zod
- **@neondatabase/serverless**: PostgreSQL serverless driver for database connectivity
- **Zod**: Schema validation library for runtime type checking

## Server Framework

- **Express.js**: Web application framework for Node.js
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Development Tools

- **ESBuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution environment for development
- **date-fns**: Date utility library for date manipulation and formatting
- **nanoid**: URL-safe unique ID generator

## Specialized UI Components

- **cmdk**: Command palette component for advanced search and navigation
- **embla-carousel-react**: Carousel component for image/content sliders
- **vaul**: Drawer component library for mobile-friendly slide-out panels
- **input-otp**: One-time password input component
- **react-resizable-panels**: Resizable panel layout system