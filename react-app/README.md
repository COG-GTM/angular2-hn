# React HN - Hacker News Client

This is a React migration of the Angular 2 HN application. It provides the same functionality as the original Angular app but uses React with TypeScript.

## Features

- Browse Hacker News feeds (news, newest, show, ask, jobs)
- View item details and comments
- User profiles
- Theme management (default, night, black)
- Settings persistence with localStorage
- System preference detection for dark mode

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## Architecture

- **React Router** for routing that matches the original Angular structure
- **React Context** for settings management (replaces Angular SettingsService)
- **Custom hooks** for API calls (replaces Angular HackerNewsAPIService)
- **TypeScript interfaces** for type safety
- **Vite** for fast development and building

## Migration Status

This is Phase 1 of the migration, which includes:
- ✅ React application structure with TypeScript
- ✅ React Router configuration matching Angular routes
- ✅ HackerNewsAPIService migrated to useHackerNewsAPI hook
- ✅ SettingsService migrated to React Context
- ✅ All data models converted to TypeScript interfaces
- ✅ Basic component structure for feeds, items, and users

## API Endpoints

The app uses the same Hacker News API endpoints as the original:
- `https://node-hnapi.herokuapp.com/{feedType}?page={page}` - Feed data
- `https://node-hnapi.herokuapp.com/item/{id}` - Item details
- `https://node-hnapi.herokuapp.com/user/{id}` - User profiles
