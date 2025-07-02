# Angular to React Migration - Phase 1

## Overview
This repository is undergoing a migration from Angular 9 to React 18. This is Phase 1 of a multi-phase migration plan.

## Current Status
- ✅ React 18 application setup complete
- ✅ TypeScript support configured
- ✅ React Router v6 integrated
- ✅ React Query for data fetching
- ✅ Axios for HTTP requests
- ✅ Basic component structure mirroring Angular architecture
- ✅ Both Angular and React apps can run simultaneously

## Architecture

### React App Structure
```
react-app/
├── src/
│   ├── components/
│   │   ├── feeds/feed/          # Equivalent to Angular FeedComponent
│   │   ├── core/header/         # Equivalent to Angular HeaderComponent
│   │   ├── core/footer/         # Equivalent to Angular FooterComponent
│   │   └── shared/models/       # TypeScript interfaces (replaces Angular models)
│   ├── services/                # API services (replaces Angular services)
│   ├── hooks/                   # React hooks for state management
│   └── utils/                   # Utility functions
```

### Key Dependencies
- **React 18**: Core framework
- **React Router v6**: Routing (replaces Angular Router)
- **@tanstack/react-query**: Data fetching and caching (replaces RxJS)
- **Axios**: HTTP client (replaces Angular HTTP Client)
- **TypeScript**: Type safety
- **Vite**: Build tool and development server

## Running Both Applications

### Angular App (Original)
```bash
export NODE_OPTIONS=--openssl-legacy-provider && npm start
# Runs on http://localhost:4200
```

### React App (New)
```bash
cd react-app
npm install
npm run dev
# Runs on http://localhost:5173
```

## Migration Progress

### Phase 1 (Current) ✅
- [x] React 18 application setup
- [x] Basic routing structure
- [x] Data models migration
- [x] API service setup
- [x] Basic Feed component
- [x] Header and Footer components

### Phase 2 (Planned)
- [ ] Migrate ItemComponent
- [ ] Migrate ItemDetailsComponent
- [ ] Migrate CommentComponent
- [ ] Migrate UserComponent
- [ ] Settings functionality

### Phase 3 (Planned)
- [ ] PWA features migration
- [ ] Service Worker setup
- [ ] Theme system migration
- [ ] Complete Angular removal

## Technical Notes

### Build Process
- React app uses Vite for fast development and optimized production builds
- Angular app continues to use Angular CLI
- No build conflicts between the two applications
- Both apps can be built and deployed independently

### Data Fetching
- Angular uses RxJS Observables with custom `lazyFetch` wrapper
- React uses React Query with Axios for equivalent functionality
- Both connect to the same Hacker News API endpoint

### State Management
- Angular uses services with dependency injection
- React uses custom hooks and React Query for state management
- Settings management migrated from Angular service to React hook

## Testing
Both applications have been tested and verified to:
- Build successfully without conflicts
- Run simultaneously on different ports
- Fetch and display real Hacker News data
- Maintain responsive design and styling
