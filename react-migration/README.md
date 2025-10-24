# Hacker News React - Phase 1: Infrastructure Setup

This is the React + TypeScript version of the Angular 9 Hacker News application, migrated from [ankehao-demo/angular2-hn](https://github.com/ankehao-demo/angular2-hn).

## Project Overview

**Phase 1 Status**: ✅ Complete - Infrastructure setup finished
**Next Phase**: Component migration from Angular to React

This project replicates the Angular application's routing structure, PWA capabilities, and build configuration using modern React best practices with Vite.

## Technology Stack

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.4.1
- **Routing**: React Router v6
- **PWA**: Vite PWA Plugin with Workbox
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React
- **Charts**: Recharts

## Project Structure

```
hacker-news-react/
├── src/
│   ├── config/
│   │   └── environment.ts       # Environment configuration
│   ├── pages/
│   │   ├── Feed.tsx             # Feed component (news, newest, show, ask, jobs)
│   │   ├── ItemDetails.tsx      # Item details (lazy loaded)
│   │   └── UserProfile.tsx      # User profile (lazy loaded)
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   ├── App.tsx                  # Main app with routing
│   └── main.tsx                 # Entry point
├── .env.development             # Development environment variables
├── .env.production              # Production environment variables
├── vite.config.ts               # Vite + PWA configuration
└── package.json                 # Dependencies and scripts
```

## Routing Structure

The routing structure matches the Angular application from `src/app/app.routes.ts`:

| Route | Component | Lazy Loaded | Description |
|-------|-----------|-------------|-------------|
| `/` | Redirect | No | Redirects to `/news/1` |
| `/news/:page` | Feed | No | News feed with pagination |
| `/newest/:page` | Feed | No | Newest stories feed |
| `/show/:page` | Feed | No | Show HN feed |
| `/ask/:page` | Feed | No | Ask HN feed |
| `/jobs/:page` | Feed | No | Jobs feed |
| `/item/:id` | ItemDetails | **Yes** | Item details page (lazy loaded with React.lazy()) |
| `/user/:id` | UserProfile | **Yes** | User profile page (lazy loaded with React.lazy()) |

### Lazy Loading

The `/item/:id` and `/user/:id` routes are lazy loaded using `React.lazy()` and `Suspense`, matching the Angular application's lazy loading pattern for `ItemDetailsModule` and `UserModule`.

## PWA Support

Progressive Web App capabilities are configured using the Vite PWA plugin with Workbox:

- **Service Worker**: Auto-updates on new versions
- **Offline Support**: Caches static assets and API responses
- **Manifest**: Web app manifest for installability
- **Runtime Caching**: Network-first strategy for Hacker News API calls

PWA configuration in `vite.config.ts`:
- Caches all static assets (JS, CSS, HTML, images)
- Network-first caching for `hacker-news.firebaseio.com` API
- Generates service worker in production builds

## Environment Configuration

Environment variables follow the Angular pattern from `src/main.ts`:

**Development** (`.env.development`):
```
VITE_APP_ENV=development
VITE_API_URL=https://hacker-news.firebaseio.com/v0
```

**Production** (`.env.production`):
```
VITE_APP_ENV=production
VITE_API_URL=https://hacker-news.firebaseio.com/v0
```

Access via `src/config/environment.ts`:
```typescript
export const environment = {
  production: import.meta.env.VITE_APP_ENV === 'production',
  apiUrl: import.meta.env.VITE_API_URL
};
```

## Available Scripts

Scripts match the Angular application's `package.json` patterns:

```bash
npm start          # Start development server (alias for dev)
npm run dev        # Start development server with HMR
npm run build      # Build for production
npm run build:dev  # Build in development mode
npm run build:prod # Build in production mode
npm run lint       # Run ESLint
npm run preview    # Preview production build
npm test           # Run tests (placeholder for Phase 2)
```

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser at `http://localhost:5173`

4. The app will auto-reload on file changes

### Testing Routes

Navigate to these URLs to test the routing:
- `http://localhost:5173/` → redirects to `/news/1`
- `http://localhost:5173/news/1` → News feed
- `http://localhost:5173/newest/1` → Newest stories
- `http://localhost:5173/show/1` → Show HN
- `http://localhost:5173/ask/1` → Ask HN
- `http://localhost:5173/jobs/1` → Jobs
- `http://localhost:5173/item/123` → Item details (lazy loaded)
- `http://localhost:5173/user/testuser` → User profile (lazy loaded)

## Build

### Production Build

```bash
npm run build
```

This will:
1. Run TypeScript compilation (`tsc -b`)
2. Create optimized Vite build in `dist/`
3. Generate service worker files
4. Create separate chunks for lazy-loaded routes
5. Generate PWA manifest

### Build Output

The production build creates:
- `dist/index.html` - Main HTML file
- `dist/assets/*.js` - JavaScript bundles (including lazy-loaded chunks)
- `dist/assets/*.css` - Optimized CSS
- `dist/sw.js` - Service worker
- `dist/manifest.webmanifest` - PWA manifest

## Phase 1 Deliverables ✅

All Phase 1 requirements have been completed:

- ✅ New React + TypeScript project initialized with Vite
- ✅ React Router v6 configured with all 7 routes from Angular app
- ✅ Lazy loading implemented for `/item/:id` and `/user/:id` using React.lazy()
- ✅ PWA support configured with Vite PWA plugin and Workbox
- ✅ Environment configuration files created (development & production)
- ✅ Build scripts set up matching Angular's package.json patterns
- ✅ Placeholder components created for all routes
- ✅ App tested locally - all routes work correctly
- ✅ Verified in browser that routing, lazy loading, and environment config work
- ✅ Production build tested and working

## Next Steps (Phase 2)

Phase 2 will involve migrating the actual Angular components:
1. Migrate feed component logic
2. Migrate item details component
3. Migrate user profile component
4. Implement Hacker News API service
5. Add state management if needed
6. Migrate shared components and utilities
7. Migrate styling and theming

## Notes

- This is infrastructure setup only - no Angular components have been migrated yet
- All placeholder components show route information for verification
- The project follows React best practices and modern patterns
- PWA features will work after production build and deployment
