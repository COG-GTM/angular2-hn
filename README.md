# Angular 2 HN — React + TypeScript + Vite

A progressive Hacker News client built with **React**, **TypeScript**, and **Vite**.

Migrated from the original Angular implementation.

## Features

- 5 feed types: Top, New, Show, Ask, Jobs with pagination
- Item details with recursive comment threads
- User profiles
- 3 themes: Default (day), Night, Black (AMOLED)
- Customizable font size and list spacing
- Open links in new tab option
- PWA support (offline-capable, installable)
- Google Analytics integration
- Responsive (mobile + desktop layouts)

## Getting Started

```bash
cd react-app
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest) |

## Tech Stack

- **React 19** with TypeScript
- **Vite** for bundling
- **React Router v7** for routing
- **Sass** for styling
- **vite-plugin-pwa** for PWA support
- **Vitest** + React Testing Library for testing

## API

Uses the [node-hnapi](https://github.com/cheeaun/node-hnapi) at `https://node-hnapi.herokuapp.com`.
