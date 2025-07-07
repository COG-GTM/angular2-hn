# Angular to React Migration - Phase 1

## Overview
This document outlines the migration approach for converting the Angular 2 Hacker News client to React. This is Phase 1 of the migration, focusing on project setup and core infrastructure.

## Migration Strategy

### Phase 1: Project Setup and Core Infrastructure ✅
- **Goal**: Establish React foundation alongside existing Angular app
- **Approach**: Create new React project in `react-app/` directory using Vite
- **Status**: Complete

#### Completed Tasks:
1. **React Project Initialization**
   - Created new React project with Vite and TypeScript template
   - Configured project name as `angular-hnpwa-react`
   - Set up modern build tooling with Vite for fast development

2. **Dependency Migration**
   - Replaced Angular dependencies with React equivalents:
     - `@angular/core` → `react` + `react-dom`
     - `@angular/router` → `react-router-dom` 
     - `@angular/service-worker` → `workbox-webpack-plugin`
   - Maintained utility dependencies: `rxjs`, `node-fetch`, `unfetch`
   - Added SCSS support with `sass` package

3. **Project Configuration**
   - Configured TypeScript support with strict settings
   - Set up SCSS compilation (matching Angular app's styling approach)
   - Created folder structure mirroring Angular organization:
     ```
     src/
     ├── components/
     │   ├── shared/
     │   │   ├── components/
     │   │   ├── services/
     │   │   └── models/
     │   ├── feeds/
     │   ├── item-details/
     │   ├── user/
     │   └── core/
     └── assets/
         └── scss/
     ```

4. **Basic App Shell**
   - Created minimal React application that builds and runs successfully
   - Implemented "Hello World" page with proper styling
   - Used theme colors matching original Angular app (#b92b27)
   - Verified build process and development server functionality

## Current State

### What Works:
- ✅ React project builds successfully (`npm run build`)
- ✅ Development server runs (`npm run dev`)
- ✅ TypeScript compilation without errors
- ✅ SCSS compilation and styling
- ✅ Basic app shell renders in browser
- ✅ Modern build tooling with Vite

### Project Structure:
```
angular2-hn/
├── [existing Angular files...]
└── react-app/                    # New React application
    ├── package.json              # React dependencies
    ├── vite.config.ts            # Vite configuration
    ├── tsconfig.json             # TypeScript config
    └── src/
        ├── App.tsx               # Main app component
        ├── App.scss              # App-specific styles
        ├── index.css             # Global styles
        └── components/           # Component structure (ready for Phase 2)
```

## Next Phases (Future Work)

### Phase 2: Component Migration
- Migrate core components (Header, Footer, Settings)
- Set up React Router for navigation
- Implement basic routing structure

### Phase 3: Service Layer Migration
- Convert HackerNewsAPIService to React/TypeScript
- Implement state management (consider Redux/Zustand vs RxJS)
- Migrate settings service functionality

### Phase 4: Feature Migration
- Migrate feed components and item display
- Implement comment system
- Add user profile functionality

### Phase 5: PWA Features
- Configure service worker with Workbox
- Implement offline functionality
- Add installability features

### Phase 6: Testing & Optimization
- Set up testing framework
- Performance optimization
- Final cleanup and Angular app removal

## Development Commands

### React App (in `react-app/` directory):
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

### Original Angular App (root directory):
```bash
npm install          # Install dependencies  
npm start           # Start Angular dev server
npm run build       # Build Angular app
```

## Notes
- Both applications can run simultaneously during migration
- React app uses port 5173 (Vite default)
- Angular app uses port 4200 (Angular CLI default)
- Migration is incremental - Angular app remains functional throughout process
