# React HN - Angular to React Migration (Phase 1)

This is the React project scaffolding for migrating the Angular2-HN application to React. This phase focuses on setting up the core React app structure and testing frameworks without porting functionality yet.

## Project Structure

```
src/
├── components/          # React components (replaces Angular components)
├── hooks/              # Custom React hooks (replaces Angular services)
├── pages/              # Route components (replaces Angular route components)
├── styles/             # SCSS files (migrated from Angular styles)
├── types/              # TypeScript interfaces and types
├── utils/              # Utility functions
└── test/               # Test utilities and setup
    └── setup.ts        # Test environment configuration
```

## Dependencies and Their Purposes

### Core Dependencies
- **react** & **react-dom**: Core React library for building user interfaces
- **react-router-dom**: Client-side routing (replaces Angular Router)
- **@tanstack/react-query**: State management and data fetching (replaces Angular services)
- **sass**: SCSS support to handle existing Angular styles
- **axios**: HTTP client for API requests (replaces Angular's HttpClient)

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: TypeScript support for type safety
- **vitest**: Testing framework (replaces Karma/Jasmine)
- **@testing-library/react**: React testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **@testing-library/user-event**: User interaction testing utilities
- **jsdom**: DOM environment for testing
- **eslint**: Code linting and quality checks
- **@typescript-eslint/eslint-plugin** & **@typescript-eslint/parser**: TypeScript-specific ESLint rules
- **prettier**: Code formatting

## Setup Instructions for New Developers

1. **Clone the repository and navigate to the React project**:
   ```bash
   git clone <repository-url>
   cd angular2-hn/react-hn
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## Available Commands

### Development
- `npm run dev` - Start the development server with hot reload
- `npm run preview` - Preview the production build locally

### Building
- `npm run build` - Build the application for production
  - Runs TypeScript compiler (`tsc`) for type checking
  - Creates optimized production build with Vite

### Testing
- `npm test` - Run tests in watch mode with Vitest
- `npm run test:ui` - Run tests with Vitest UI interface

### Code Quality
- `npm run lint` - Run ESLint to check code quality and style
  - Checks TypeScript and TSX files
  - Reports unused disable directives
  - Fails on any warnings (max-warnings 0)

## Development Workflow

1. **Code Structure**: Follow the established directory structure with components, hooks, pages, etc.
2. **Styling**: Use SCSS files in the `src/styles/` directory
3. **Testing**: Write tests alongside your components and place test utilities in `src/test/`
4. **Type Safety**: Leverage TypeScript interfaces in `src/types/` for better code quality
5. **Code Quality**: Run `npm run lint` before committing to ensure code standards

## Migration Notes

This project is Phase 1 of the Angular-to-React migration. The current setup provides:
- Modern React development environment with Vite
- TypeScript support matching the original Angular project
- Testing framework ready for component testing
- SCSS support for existing styles
- Routing and state management foundations

Future phases will focus on porting actual functionality from the Angular application to this React foundation.

## Technology Stack

- **React 19** with TypeScript
- **Vite 7** for fast development and building
- **Vitest** for testing with React Testing Library
- **React Router** for client-side routing
- **TanStack Query** for state management
- **Axios** for HTTP requests
- **SCSS** for styling
- **ESLint + Prettier** for code quality
