# Hacker News PWA — React + TypeScript + Vite

A progressive Hacker News client built with React, TypeScript, and Vite.

## Features

- Browse Hacker News feeds: Top, New, Show, Ask, Jobs
- View item details with nested comments
- User profiles
- Multiple themes: Default, Night, AMOLED Black
- Settings: font size, list spacing, open links in new tab
- PWA support with offline caching
- Google Analytics integration
- Lazy loaded routes for Item Details and User pages

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast builds and HMR
- **React Router v6** for client-side routing
- **React Context + useReducer** for state management
- **SCSS** for styling with theme support
- **Vite PWA Plugin** (Workbox) for service worker
- **Vitest** + React Testing Library for tests

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## Project Structure

```
src/
├── api/          # API functions (fetch from HN API)
├── components/   # React components
│   ├── feed/     # Feed listing pages
│   ├── item-details/ # Item detail + comments
│   ├── layout/   # Header, Footer, Settings
│   ├── shared/   # Loader, ErrorMessage
│   └── user/     # User profile page
├── context/      # React Context (Settings)
├── hooks/        # Custom hooks (useFeed, useItemDetails, useUser)
├── styles/       # Global SCSS, themes, variables
├── types/        # TypeScript interfaces
└── utils/        # Utility functions
```

## API

Uses the [node-hnapi](https://github.com/cheeaun/node-hnapi) proxy for Hacker News data.
