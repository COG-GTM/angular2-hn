# React Infrastructure Setup Documentation

## Overview
This document explains the configuration decisions made during Phase 1 of migrating the Angular 9 Hacker News PWA to React with TypeScript.

## Technology Choices

### Build Tool: Vite
- **Rationale**: Modern, fast build tool with excellent TypeScript support and HMR
- **Advantages over Angular CLI**:
  - Significantly faster development server startup
  - Near-instant hot module replacement
  - Native ES modules support
  - Better optimization for production builds
  - Simpler configuration

### TypeScript Configuration
- **Version**: TypeScript 5.6.2 (upgraded from Angular's 3.7.5)
- **Target**: ES2020 (upgraded from Angular's ES2015)
- **Strict Mode**: Enabled with comprehensive type checking
  - `strict: true`
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
  - `noFallthroughCasesInSwitch: true`
- **Module Resolution**: Bundler mode for optimal Vite integration
- **Path Aliases**: Configured `@/*` for cleaner imports (matching the setup pattern)

### Routing: React Router v6
- **Library**: react-router-dom
- **Lazy Loading**: Implemented using `React.lazy()` and `Suspense`
- **Route Structure**: Mirrors the Angular routes from `app.routes.ts`:
  - Feed routes: `/news/:page`, `/newest/:page`, `/show/:page`, `/ask/:page`, `/jobs/:page`
  - Detail routes: `/item`, `/user`
  - Default redirect: `/` → `/news/1`

### PWA: Vite Plugin PWA with Workbox
- **Plugin**: vite-plugin-pwa
- **Service Worker Strategy**: Workbox-based with automatic updates
- **Configuration Highlights**:
  - **Manifest**: Preserved theme color (#b92b27) and branding from Angular app
  - **Asset Caching**: Glob patterns for static assets (JS, CSS, HTML, images, fonts)
  - **Runtime Caching**: NetworkFirst strategy for Hacker News API calls
    - Cache name: 'hn-api-cache'
    - Max entries: 100
    - Max age: 24 hours
  - **Development**: Service worker disabled in dev mode for easier debugging

## File Structure

```
react-hn/
├── src/
│   ├── pages/              # Route components (lazy-loaded)
│   │   ├── Feed.tsx        # Feed page (news, newest, show, ask, jobs)
│   │   ├── ItemDetails.tsx # Item details page
│   │   └── User.tsx        # User profile page
│   ├── router.tsx          # Route configuration with lazy loading
│   ├── main.tsx            # Application entry point
│   └── App.tsx             # Root component (can be repurposed or removed)
├── .env.development        # Development environment variables
├── .env.production         # Production environment variables
├── vite.config.ts          # Vite and PWA configuration
└── tsconfig.app.json       # TypeScript compiler options
```

## PWA Manifest Configuration

Preserved from Angular app:
- **Name**: "React HN" (updated from "Angular 2 HN")
- **Theme Color**: #b92b27 (Hacker News orange/red)
- **Background Color**: #ffffff
- **Display Mode**: standalone
- **Orientation**: portrait
- **Start URL**: Includes UTM tracking parameter

## Environment Variables

- `VITE_API_URL`: Hacker News Firebase API endpoint
  - Development: https://hacker-news.firebaseio.com/v0
  - Production: https://hacker-news.firebaseio.com/v0

## Caching Strategy

### Static Assets (Prefetch)
- JavaScript bundles
- CSS files
- HTML files
- Images and icons
- Web fonts

### API Requests (NetworkFirst)
- Attempts network request first
- Falls back to cache if offline
- Caches successful responses for 24 hours
- Maximum 100 cached entries

## Firebase Hosting Compatibility

The build output structure is compatible with Firebase hosting:
- **Build Output**: `dist/` directory
- **SPA Routing**: All routes should be configured to serve `index.html` (in `firebase.json`)
- **Asset Paths**: Relative paths work with Firebase's static hosting

### Firebase Configuration (Recommended)
```json
{
  "hosting": {
    "public": "react-hn/dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Build Commands

- **Development**: `npm run dev` - Starts Vite dev server on http://localhost:5173
- **Production Build**: `npm run build` - TypeScript check + Vite build
- **Preview**: `npm run preview` - Preview production build locally
- **Type Check**: `tsc -b` - Standalone TypeScript compilation check

## Service Worker Generation

In production builds, the Vite PWA plugin automatically:
1. Generates `sw.js` (service worker file)
2. Creates `manifest.webmanifest` (PWA manifest)
3. Injects service worker registration code into HTML
4. Pre-caches static assets based on glob patterns
5. Configures runtime caching for API calls

## Type Safety Improvements

Compared to Angular app (TypeScript 3.7.5), this setup uses:
- **TypeScript 5.6.2**: Latest features and performance improvements
- **Stricter Checks**: More comprehensive type checking enabled
- **Better IDE Support**: Enhanced autocomplete and error detection
- **Bundler Module Resolution**: Optimized for modern bundlers

## Development Workflow

1. **Start Dev Server**: `npm run dev`
   - Service worker disabled for faster iteration
   - Hot module replacement for instant updates
2. **Make Changes**: Edit files in `src/`
3. **Test Build**: `npm run build`
   - Verify TypeScript compilation
   - Ensure service worker generation works
4. **Preview**: `npm run preview`
   - Test production build locally
   - Verify PWA features work

## Next Steps (Future Phases)

1. **Component Migration**: Port Angular components to React
2. **State Management**: Implement global state (if needed)
3. **API Service Layer**: Create TypeScript services for Hacker News API
4. **Styling**: Port SCSS styles to Tailwind CSS (already configured)
5. **Testing**: Set up testing infrastructure (Jest/Vitest + React Testing Library)
6. **Asset Migration**: Copy icons and images from Angular app
7. **Performance Optimization**: Code splitting, lazy loading optimization

## Key Differences from Angular

| Feature | Angular | React |
|---------|---------|-------|
| Build Tool | Angular CLI (Webpack) | Vite |
| TypeScript | 3.7.5 | 5.6.2 |
| Service Worker | @angular/service-worker | Workbox (vite-plugin-pwa) |
| Routing | @angular/router | react-router-dom |
| Lazy Loading | loadChildren | React.lazy() + Suspense |
| Styling | SCSS | Tailwind CSS |
| State Management | RxJS + Services | TBD (Context/Zustand/etc.) |

## Configuration Files Reference

- **vite.config.ts**: Build and PWA configuration
- **tsconfig.json**: TypeScript project references
- **tsconfig.app.json**: TypeScript compiler options for app
- **package.json**: Dependencies and scripts
- **.env.development**: Development environment variables
- **.env.production**: Production environment variables

## Known Limitations

1. **Icons Not Migrated**: Icon assets need to be copied from Angular app
2. **No Components Yet**: Only placeholder components exist
3. **No API Integration**: Hacker News API service needs to be implemented
4. **No Styling**: Minimal styling applied (Tailwind ready but not styled)
5. **No Tests**: Testing infrastructure not yet set up

## Verification Steps Completed

- ✅ React app created with TypeScript
- ✅ React Router installed and configured
- ✅ Lazy loading implemented with React.lazy() and Suspense
- ✅ Vite PWA plugin configured with Workbox
- ✅ Production build generates service worker
- ✅ Firebase hosting compatibility maintained
- ✅ TypeScript strict mode enabled
- ✅ Environment variables configured
