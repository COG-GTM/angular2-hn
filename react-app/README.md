# React HN - Phase 1 Migration

This is Phase 1 of the migration from Angular to React for the Hacker News client.

## Phase 1 Deliverables (Completed)
- ✅ React + TypeScript project initialized with Vite
- ✅ React Router configured with equivalent routes to Angular app
- ✅ Service worker/PWA functionality set up with Workbox
- ✅ Basic project structure for future component migration

## Routes
- `/` - Redirects to `/news/1`
- `/news/:page` - News feed
- `/newest/:page` - Newest stories feed
- `/show/:page` - Show HN feed
- `/ask/:page` - Ask HN feed
- `/jobs/:page` - Jobs feed
- `/item/:id` - Item details (lazy loaded)
- `/user/:id` - User profile (lazy loaded)

## Development

```bash
npm install
npm start      # Runs on localhost:4200
npm run build  # Production build with service worker
npm run preview # Preview production build
```

## PWA Features
- Service worker with Workbox
- Offline support
- Installable to home screen
- Multiple icon sizes for different devices
- Theme color: #b92b27

## Project Structure
```
src/
├── components/     # Future component implementation
│   └── shared/     # Shared/reusable components
├── services/       # API services
├── models/         # TypeScript interfaces
├── routes/         # Route configuration and page components
│   └── pages/      # Page-level components
├── contexts/       # React contexts (Settings, etc.)
├── hooks/          # Custom React hooks
└── config/         # Configuration files
```

## Next Steps (Phase 2+)
- Migrate Angular components to React
- Implement feed display logic
- Implement item details and comment rendering
- Port styling from Angular SCSS
- Add tests
