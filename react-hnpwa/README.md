# React Hacker News PWA - Phase 1 Migration

This is the React version of the Angular Hacker News PWA, created as part of Phase 1 of the Angular to React migration.

## Project Structure

The React project maintains a similar structure to the Angular version but organized for React patterns:

```
react-hnpwa/
├── src/
│   ├── components/           # React components organized by feature
│   │   ├── feeds/           # Feed-related components (equivalent to Angular feeds module)
│   │   ├── item-details/    # Item detail components (equivalent to Angular item-details module)
│   │   ├── user/            # User profile components (equivalent to Angular user module)
│   │   ├── core/            # Core components like header, footer (equivalent to Angular core module)
│   │   └── shared/          # Shared/reusable components (equivalent to Angular shared module)
│   ├── services/            # API services and business logic
│   ├── types/               # TypeScript type definitions
│   ├── hooks/               # Custom React hooks
│   ├── App.tsx              # Main application component with routing
│   └── main.tsx             # Application entry point
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
└── README.md                # This file
```

## Dependencies Migration

### Angular → React Equivalents

| Angular Dependency | React Equivalent | Purpose |
|-------------------|------------------|---------|
| `@angular/core` | `react` + `react-dom` | Core framework |
| `@angular/router` | `react-router-dom` | Client-side routing |
| `@angular/service-worker` | *To be migrated* | PWA service worker |
| `rxjs` | `rxjs` (kept) | Reactive programming for API calls |

### Key Dependencies Added

- `react` (^19.1.0) - Core React library
- `react-dom` (^19.1.0) - React DOM rendering
- `react-router-dom` (^7.6.3) - Client-side routing
- `rxjs` (^7.8.2) - Reactive programming (kept from Angular)

## Build Configuration

The project is configured to maintain the same build output structure as the Angular version:

- **Build Output**: `dist/angular-hnpwa/` (same as Angular)
- **Development Server**: Port 4200 (same as Angular)
- **Build Tool**: Vite (modern replacement for Angular CLI)

## Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `start` | `vite` | Start development server |
| `dev` | `vite` | Start development server (alias) |
| `build` | `tsc -b && vite build` | Build for production |
| `lint` | `eslint .` | Run linting |
| `preview` | `vite preview` | Preview production build |

## Routing Structure

The React routing maintains the same URL structure as the Angular version:

- `/` → redirects to `/news/1`
- `/news/:page` → News feed
- `/newest/:page` → Newest stories
- `/show/:page` → Show HN stories  
- `/ask/:page` → Ask HN stories
- `/jobs/:page` → Job postings
- `/item/:id` → Item details
- `/user/:id` → User profile

## Development

### Running the Application

```bash
cd react-hnpwa
npm install
npm start
```

The application will be available at http://localhost:4200/

### Building for Production

```bash
npm run build
```

Build output will be created in `../dist/angular-hnpwa/`

## Phase 1 Completion Status

✅ **Completed:**
- New React project structure created with Vite
- Angular dependencies replaced with React equivalents
- Basic working React application with routing
- Build output maintains same path structure (`dist/angular-hnpwa`)
- Package.json configured with proper scripts
- Documentation created

🔄 **Future Phases:**
- Component migration from Angular to React
- Service migration (HackerNewsAPIService, SettingsService)
- PWA features migration (service worker, manifest)
- Styling migration (SCSS to CSS modules or styled-components)
- Testing setup migration

## Notes

- This is Phase 1 only - the project structure and basic routing are set up
- Actual Angular components have not been migrated yet
- PWA features will be migrated in later phases
- The build maintains compatibility with existing deployment processes
