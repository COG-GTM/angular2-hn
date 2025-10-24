# React HN - Phase 1 Infrastructure

This is the React version of the Angular2-HN application, currently in Phase 1 of migration.

## Overview

Phase 1 focuses on setting up the infrastructure:
- ✅ Vite + React + TypeScript
- ✅ React Router v6 with route structure matching Angular
- ✅ PWA support with vite-plugin-pwa (using Workbox)
- ✅ TypeScript configuration
- ✅ ESLint and Prettier setup
- ✅ Build and development scripts

## Project Structure

```
react-app/
├── public/           # Static assets (manifest, icons, favicon)
├── src/
│   ├── components/   # Reusable components
│   │   └── Layout.tsx
│   ├── pages/        # Page components
│   │   ├── FeedPage.tsx
│   │   ├── ItemPage.tsx
│   │   └── UserPage.tsx
│   ├── routes/       # Routing configuration
│   │   └── index.tsx
│   ├── main.tsx      # Application entry point
│   └── index.css     # Global styles
├── package.json
├── tsconfig.json     # TypeScript configuration
├── vite.config.ts    # Vite and PWA configuration
└── README.md
```

## Routes

The application includes the following routes matching the Angular version:

- `/` → redirects to `/news/1`
- `/news/:page` - News feed
- `/newest/:page` - Newest stories
- `/show/:page` - Show HN stories
- `/ask/:page` - Ask HN stories
- `/jobs/:page` - Job listings
- `/item/:id` - Item details (lazy loaded)
- `/user/:id` - User profile (lazy loaded)

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

## PWA Features

The application is configured as a Progressive Web App with:
- Service Worker for offline support
- Web App Manifest for installability
- Asset caching strategies (prefetch for app files, runtime caching for API calls)
- Theme color: #b92b27
- Standalone display mode

## Technology Stack

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **React Router v6**: Routing
- **vite-plugin-pwa**: PWA support with Workbox
- **ESLint & Prettier**: Code quality

## Next Phases

- **Phase 1 (Current)**: Infrastructure setup ✅
- **Phase 2**: Component migration (FeedComponent, ItemComponent, etc.)
- **Phase 3**: Service integration (HackerNewsAPIService)
- **Phase 4**: Styling and themes
- **Phase 5**: Testing and optimization
- **Phase 6**: Final migration and deployment

## Notes

- This React app runs in parallel with the existing Angular app
- The Angular app continues to work and is located in the parent directory
- Components are currently placeholders and will be implemented in subsequent phases
- Route structure matches Angular's app.routes.ts configuration
- PWA configuration mirrors Angular's ngsw-config.json settings
