# Angular2 HN React - Migration Foundation

This is **Phase 1** of the migration from Angular 9 to React for the Angular2 HN (Hacker News PWA) project. This phase focuses on establishing the project infrastructure and comprehensive testing frameworks, not on actual component migration.

## Project Overview

This React application serves as the foundation for migrating the existing [Angular 9 Hacker News client](https://github.com/housseindjirdeh/angular2-hn). Phase 1 establishes the technical infrastructure needed for a successful migration.

**Related Jira Ticket:** MBA-40

## What's Included in Phase 1

### ✅ Core Infrastructure

- **Vite** - Modern build tool with fast HMR and optimized production builds
- **React 19** with TypeScript (strict mode enabled)
- **React Router v6** - Client-side routing with lazy loading support
- **React Query** - API state management and caching
- **React Context** - Settings management (theme, preferences)

### ✅ Styling System

- **SCSS** - Full SCSS support with preprocessor configuration
- **Theme System** - Migrated 3-theme system (day/night/amoled black) from Angular app
- **Theme Variables** - Comprehensive variable system with 12+ variables per theme
- **Responsive Design** - Mobile-first media queries

### ✅ Testing Infrastructure

- **Vitest** - Fast unit testing with React Testing Library
  - 90%+ coverage thresholds (lines, functions, branches, statements)
  - jsdom environment
  - Custom test utilities and setup
- **Cypress** - E2E testing with code coverage support
  - Component and integration testing
  - Custom commands and utilities

### ✅ Code Quality Tools

- **ESLint** - TypeScript-aware linting with React-specific rules
- **Prettier** - Code formatting (matching Angular project: 4-space tabs, 120 char width)
- **TypeScript** - Strict type checking with verbatimModuleSyntax

### ✅ PWA Support

- **Vite PWA Plugin** - Service worker generation with Workbox
- **Web App Manifest** - Migrated from Angular project
- **PWA Assets** - All icons and metadata copied from original project
- **Offline Support** - Configured caching strategies for API requests

### ✅ Development Environment

- **Hot Module Replacement** - Fast development with instant updates
- **Source Maps** - Full debugging support in development and production
- **Environment Variables** - .env configuration for API URLs
- **Code Splitting** - Automatic vendor chunk splitting for optimal loading

## Project Structure

```
angular2-hn-react/
├── src/
│   ├── contexts/          # React Context providers (SettingsContext)
│   ├── routes/            # React Router configuration with lazy loading
│   ├── services/          # API service layer and React Query client
│   ├── hooks/             # Custom React hooks (future)
│   ├── types/             # TypeScript type definitions
│   ├── components/        # Reusable components (future)
│   ├── pages/             # Page-level components (placeholder stubs)
│   ├── styles/            # Global SCSS and theme system
│   │   ├── _media.scss           # Responsive breakpoints
│   │   ├── _theme_variables.scss # Theme color definitions
│   │   ├── _themes.scss          # Theme mixin and implementations
│   │   └── global.scss           # Global styles
│   ├── App.tsx            # Root app component with routing
│   ├── main.tsx           # Application entry point
│   └── setupTests.ts      # Test configuration
├── cypress/
│   ├── e2e/               # E2E test specs
│   └── support/           # Cypress utilities and commands
├── public/
│   └── assets/icons/      # PWA icons (migrated from Angular)
├── vite.config.ts         # Vite configuration with PWA
├── vitest.config.ts       # Vitest test configuration
├── cypress.config.ts      # Cypress E2E configuration
├── tsconfig.json          # TypeScript configuration
├── eslint.config.js       # ESLint configuration
└── .prettierrc            # Prettier configuration
```

## Available Scripts

### Development

```bash
npm run dev              # Start development server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build
```

### Testing

```bash
npm run test             # Run unit tests in watch mode
npm run test:run         # Run unit tests once
npm run test:coverage    # Run tests with coverage report
npm run test:ui          # Open Vitest UI
npm run cypress          # Open Cypress test runner
npm run cypress:headless # Run Cypress tests in headless mode
npm run e2e              # Run E2E tests (starts server automatically)
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Run TypeScript type checking
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:5173

### Running Tests

```bash
# Run all unit tests
npm run test:run

# Run with coverage
npm run test:coverage

# Open Cypress for E2E testing
npm run cypress
```

## Key Technical Decisions

### Component Organization
Following the Angular app's feature-based module structure, we'll organize React components by feature in future phases.

### CSS Methodology
Using plain SCSS with the existing theme system (migrated from Angular) to maintain consistency and leverage the proven theme architecture.

### Test Organization
- Unit tests: Co-located with components (`.test.tsx` files)
- E2E tests: Organized by user flow in `cypress/e2e/`

### PWA Strategy
Using Vite PWA plugin with Workbox for service worker generation. Configured with:
- NetworkFirst strategy for API calls
- 24-hour cache expiration
- Automatic precaching of static assets

### Code Splitting
Vendor chunks separated for:
- React core libraries (react, react-dom, react-router-dom)
- Data fetching libraries (@tanstack/react-query)

## Migration Strategy

This Phase 1 establishes the foundation. Future phases will include:

1. **Phase 2** - Component migration (Header, Footer, Navigation)
2. **Phase 3** - Feed and item listing components
3. **Phase 4** - Item detail and comment components
4. **Phase 5** - User profile components
5. **Phase 6** - Testing, optimization, and deployment

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=https://api.hnpwa.com/v0
VITE_APP_NAME=Angular2 HN React
```

## Success Criteria ✅

All Phase 1 success criteria have been met:

- ✅ React development server starts without errors
- ✅ Vitest test runner executes successfully
- ✅ Cypress can open and run tests
- ✅ PWA manifest validates correctly
- ✅ TypeScript compilation works without errors
- ✅ All linting and formatting rules pass
- ✅ Production build completes successfully

## Known Issues

- **SCSS Deprecation Warnings**: The migrated theme system uses deprecated SCSS functions (`darken()`, `@import`). These are warnings only and don't affect functionality. Will be addressed in a future refactor.

## Contributing

This is a migration project. For contribution guidelines, please refer to the [original Angular2 HN project](https://github.com/housseindjirdeh/angular2-hn).

## License

Same as the original Angular2 HN project.

## Related Resources

- [Original Angular2 HN Repository](https://github.com/housseindjirdeh/angular2-hn)
- [Vite Documentation](https://vitejs.dev/)
- [React Router v6 Documentation](https://reactrouter.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vitest Documentation](https://vitest.dev/)
- [Cypress Documentation](https://docs.cypress.io/)
