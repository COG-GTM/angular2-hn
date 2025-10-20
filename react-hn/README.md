# React HN - Phase 1: Foundation Setup

This is the React foundation for migrating the Angular 9 Hacker News PWA to React.

## Phase 1 Completed Features

### ✅ Project Setup
- **Vite + React + TypeScript**: Modern build tooling with fast HMR
- **Project Structure**: Organized folder structure mirroring Angular app organization
  - `src/components/` - React components (feeds, item-details, user, shared)
  - `src/services/` - API services
  - `src/contexts/` - React Context for state management
  - `src/models/` - TypeScript interfaces/types
  - `src/hooks/` - Custom React hooks (ready for future use)
  - `src/utils/` - Utility functions

### ✅ Routing Configuration
- **React Router v6**: Configured with all routes from Angular app
  - `/` → redirects to `/news/1`
  - `/news/:page` - News feed
  - `/newest/:page` - Newest items feed
  - `/show/:page` - Show HN feed
  - `/ask/:page` - Ask HN feed
  - `/jobs/:page` - Jobs feed
  - `/item/:id` - Item details (lazy loaded)
  - `/user/:id` - User profile (lazy loaded)

### ✅ State Management
- **React Context API**: Replaces Angular's dependency injection
- **SettingsContext**: Manages application settings
  - Theme switching (default, night mode)
  - System preference detection for dark mode
  - Font size customization
  - List spacing customization
  - Open links in new tab preference
  - LocalStorage persistence

### ✅ Core Dependencies
- **API Service**: HackerNewsAPIService migrated to async/await pattern
  - `fetchFeed()` - Get feed items
  - `fetchItemContent()` - Get item details with poll support
  - `fetchUser()` - Get user profile
  - Base URL: `https://node-hnapi.herokuapp.com`

### ✅ PWA Support
- **Vite PWA Plugin**: Configured with Workbox
- **Service Worker**: Auto-update registration
- **Manifest**: PWA manifest with icons and theme colors
- **Runtime Caching**: NetworkFirst strategy for HN API calls
- **Offline Support**: Ready for offline functionality

### ✅ TypeScript Models
All Angular models migrated to TypeScript interfaces:
- `Story` - Story/item data structure
- `Comment` - Comment data with nesting support
- `User` - User profile data
- `Settings` - Application settings
- `PollResult` - Poll option data
- `FeedType` - Feed type union type

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Opens at `http://localhost:3000`

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Type Check
```bash
npm run lint
```

## Next Steps (Phase 2+)

The foundation is now ready for component migration:

1. **Phase 2**: Migrate Feed Components
   - Feed list component
   - Item component
   - Pagination logic

2. **Phase 3**: Migrate Item Details
   - Item details component
   - Comment component with nesting
   - Comment collapse/expand functionality

3. **Phase 4**: Migrate User Profile
   - User component
   - User stats display

4. **Phase 5**: Migrate Core Components
   - Header component
   - Footer component
   - Settings panel component

5. **Phase 6**: Styling & Theming
   - Migrate SCSS styles to CSS/styled-components
   - Implement theme system
   - Responsive design

6. **Phase 7**: Testing & Optimization
   - Add unit tests
   - Add E2E tests
   - Performance optimization
   - PWA testing

## Architecture Notes

### State Management
- Using React Context API instead of Angular services
- Settings are persisted to localStorage
- System dark mode preference is detected and respected

### Routing
- React Router v6 with lazy loading for item-details and user routes
- Suspense boundaries for code splitting
- Navigate component for redirects

### API Layer
- Migrated from RxJS Observables to async/await Promises
- Error handling with try/catch
- Same API endpoints as Angular version

### PWA Configuration
- Workbox configured in vite.config.ts
- NetworkFirst caching strategy for API calls
- 24-hour cache expiration for API responses
- Manifest configured with all icon sizes

## Project Structure

```
react-hn/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── feeds/       # Feed-related components
│   │   ├── item-details/# Item detail components
│   │   ├── user/        # User profile components
│   │   └── shared/      # Shared/common components
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── models/          # TypeScript interfaces
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── routes.tsx       # Route configuration
├── index.html           # HTML template
├── vite.config.ts       # Vite + PWA configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Technology Stack

- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Vite 7** - Build tool
- **React Router 7** - Routing
- **Workbox 7** - Service worker/PWA
- **Vite PWA Plugin** - PWA integration

## Migration Strategy

This project follows a phased migration approach:
1. ✅ Setup foundation (this phase)
2. Migrate components incrementally
3. Migrate styles and themes
4. Add tests
5. Optimize and deploy

Each component will be migrated to maintain feature parity with the Angular version while leveraging React patterns and hooks.
