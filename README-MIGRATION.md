# React Migration - Phase 1

## Overview

This is **Phase 1** of migrating the Angular 2 Hacker News client (COG-GTM/angular2-hn) to React. The current app is a progressive web app that displays Hacker News feeds, item details, comments, and user profiles built with Angular 9.

## Migration Progress

### Phase 1: Foundation Setup ✅
- ✅ React application structure initialized with Vite and TypeScript
- ✅ PWA support configured with service workers (using vite-plugin-pwa)
- ✅ SCSS support added for existing styles
- ✅ React Router installed to replace Angular Router
- ✅ State management setup with React Context API
- ✅ Unfetch library maintained for API compatibility
- ✅ Basic folder structure created (components, services, utilities)

### Future Phases (Planned)
- **Phase 2**: Component Migration
  - Migrate core components (Header, Footer, Settings)
  - Migrate feed components (FeedComponent, ItemComponent)
  - Migrate item details and comment components
- **Phase 3**: Service Layer Migration
  - Migrate HackerNewsAPIService to React hooks/services
  - Migrate SettingsService functionality
- **Phase 4**: Theme System Migration
  - Implement theme support (default, night, AMOLED black themes)
  - Migrate SCSS styles to React components
- **Phase 5**: Testing & Optimization
  - Add comprehensive testing
  - Performance optimization
  - Final PWA testing and deployment

## Technical Architecture

### Current Angular App Features
- **TypeScript**: Full TypeScript support maintained in React version
- **PWA Support**: Service workers for offline capabilities and installability
- **SCSS Styling**: Existing SCSS styles will be migrated
- **Theme System**: Three themes (default, night, AMOLED black) to be migrated
- **API Integration**: Uses Hacker News API via node-hnapi.herokuapp.com
- **Responsive Design**: Mobile-first responsive design

### React App Structure
```
react-hn-app/
├── src/
│   ├── components/          # React components (to be migrated)
│   ├── services/           # API services and utilities
│   ├── utilities/          # Helper functions and utilities
│   ├── contexts/           # React Context for state management
│   └── ...
├── public/                 # Static assets and PWA manifest
├── vite.config.ts         # Vite configuration with PWA plugin
└── package.json           # Dependencies and scripts
```

### Key Dependencies
- **React 18** with TypeScript support
- **Vite** for fast development and builds
- **React Router DOM** for client-side routing
- **Vite PWA Plugin** for service worker and PWA features
- **Tailwind CSS** + **SCSS** for styling
- **Unfetch** for API requests (maintaining compatibility)
- **Shadcn/UI** components for modern UI elements

## Development Commands

```bash
# Navigate to React app directory
cd react-hn-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Migration Strategy

This migration follows a **progressive approach**:

1. **Parallel Development**: React app is built alongside the existing Angular app
2. **Feature Parity**: Each phase ensures feature parity with the Angular version
3. **Incremental Migration**: Components and services are migrated incrementally
4. **Testing at Each Phase**: Comprehensive testing after each migration phase
5. **Gradual Cutover**: Final cutover only after full feature parity is achieved

## Current Status

✅ **Phase 1 Complete**: React foundation is set up with all necessary tooling, PWA support, and basic architecture. Ready for component migration in Phase 2.

---

*This migration maintains all existing functionality while modernizing the codebase to React and improving development experience with Vite.*
