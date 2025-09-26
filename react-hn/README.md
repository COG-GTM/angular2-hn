# React HN - Hacker News Client

This is a React-based Hacker News client migrated from Angular. This project represents Phase 1 of the migration, focusing on project setup, build system configuration, and core infrastructure.

## Project Overview

This React application is a complete rewrite of the Angular Hacker News client, maintaining feature parity while leveraging modern React patterns and tooling.

### Key Features
- 📱 Progressive Web App (PWA) with offline support
- 🚀 Fast development with Vite
- 📊 Data fetching with React Query
- 🎨 TypeScript for type safety
- 🧪 Testing with Vitest and React Testing Library
- 📦 Code splitting and optimization

## Architecture Mapping

### Angular → React Migration

| Angular Concept | React Equivalent | Implementation |
|----------------|------------------|----------------|
| Angular Services | React Query + Custom Hooks | `src/services/api.ts` |
| Angular Router | React Router | `src/App.tsx` routing |
| Angular Components | React Components | `src/components/` |
| RxJS Observables | React Query | Data fetching hooks |
| Angular CLI | Vite | Build system |
| Angular PWA | Vite PWA Plugin | Service worker config |
| Injectable Services | React Context | `src/contexts/` |

### Project Structure

```
react-hn/
├── public/                 # Static assets (copied from Angular)
│   ├── assets/            # Icons, images
│   └── favicon.ico        # App favicon
├── src/
│   ├── components/        # React components
│   │   ├── Feed.tsx       # Story feed display
│   │   ├── ItemDetails.tsx # Story details view
│   │   └── User.tsx       # User profile view
│   ├── contexts/          # React contexts
│   │   └── SettingsContext.tsx # App settings management
│   ├── services/          # API services
│   │   └── api.ts         # React Query hooks
│   ├── types/             # TypeScript interfaces
│   │   └── index.ts       # Data models
│   ├── test/              # Test configuration
│   │   └── setup.ts       # Test setup
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Technology Stack

### Core Dependencies
- **React 19.1.1** - UI library
- **React Router 7.9.2** - Client-side routing
- **React Query 5.90.2** - Data fetching and caching
- **TypeScript 5.9.2** - Type safety
- **Vite 7.1.7** - Build tool and dev server

### Development Tools
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing utilities
- **ESLint** - Code linting
- **Prettier** - Code formatting

### PWA Features
- **Vite PWA Plugin** - Service worker generation
- **Workbox** - Caching strategies
- **Web App Manifest** - App installation

## Configuration Details

### TypeScript Configuration
The TypeScript configuration matches the original Angular setup:
- Target: ES2015
- Libraries: ES2018, DOM, DOM.Iterable, ES6
- Strict mode enabled
- Source maps enabled

### Build Configuration
- **Code Splitting**: Vendor, router, and query chunks
- **PWA**: Automatic service worker generation
- **Caching**: API responses cached with NetworkFirst strategy
- **Assets**: Optimized bundling and compression

### API Integration
- **Base URL**: `https://node-hnapi.herokuapp.com`
- **Endpoints**: 
  - Feed data: `/{feedType}?page={page}`
  - Item details: `/item/{id}`
  - User profiles: `/user/{id}`
- **Caching**: React Query with background updates

## Available Scripts

| Command | Description | Angular Equivalent |
|---------|-------------|-------------------|
| `npm start` | Start development server | `ng serve` |
| `npm run build` | Build for production | `ng build` |
| `npm test` | Run unit tests | `ng test` |
| `npm run lint` | Lint code | `ng lint` |
| `npm run preview` | Preview production build | - |

## Development Workflow

### Getting Started
1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. Open browser to `http://localhost:5173`

### Building for Production
1. Run build: `npm run build`
2. Files generated in `dist/` directory
3. PWA service worker automatically generated

### Testing
1. Run tests: `npm test`
2. Tests use Vitest with jsdom environment
3. React Testing Library for component testing

## PWA Configuration

The app includes full PWA support with:
- **Service Worker**: Automatic caching of app shell and API responses
- **Manifest**: App installation on mobile devices
- **Offline Support**: Cached content available offline
- **Background Sync**: API responses cached for offline access

### Caching Strategy
- **App Shell**: Precached for instant loading
- **API Responses**: NetworkFirst with 1-year expiration
- **Assets**: Cached with versioning for updates

## Migration Status

### ✅ Phase 1 Complete (Current)
- [x] Project setup with Vite
- [x] TypeScript configuration
- [x] React Router setup
- [x] React Query integration
- [x] PWA configuration
- [x] Basic component structure
- [x] Settings context
- [x] API service hooks
- [x] Build system configuration

### 🚧 Phase 2 (Next)
- [ ] Component implementation
- [ ] Styling migration
- [ ] Advanced features
- [ ] Performance optimization

## Comparison with Angular Version

### Performance Improvements
- **Faster Development**: Vite hot reload vs Angular CLI
- **Smaller Bundle**: React vs Angular framework overhead
- **Better Caching**: React Query vs RxJS observables

### Feature Parity
- ✅ Feed browsing (news, newest, show, ask, jobs)
- ✅ Story details with comments
- ✅ User profiles
- ✅ Settings management
- ✅ PWA functionality
- ✅ Offline support

### Code Quality
- **TypeScript**: Maintained strict typing
- **Testing**: Modern testing tools (Vitest vs Karma/Jasmine)
- **Linting**: ESLint with React-specific rules
- **Formatting**: Prettier with same configuration

## Contributing

This project follows the same code style as the original Angular version:
- 4-space indentation
- Single quotes
- 120 character line length
- Trailing commas (ES5)

## License

Same license as the original Angular project.
