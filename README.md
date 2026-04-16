# React Hacker News

A progressive web application built with React, TypeScript, and Vite — inspired by [Hacker News](https://news.ycombinator.com).

> Migrated from Angular to React + TypeScript + Vite.

## Features

- View top, newest, show, ask, and job stories from Hacker News
- View story details and comments (with nested/recursive comment threads)
- View user profiles
- Settings panel with theme switching (default, night, AMOLED black), font size, and list spacing controls
- Progressive Web App (PWA) with offline support
- Google Analytics integration

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast dev server and builds
- **React Router v6** for client-side routing
- **React Context + Hooks** for state management
- **SCSS Modules** for scoped component styles
- **vite-plugin-pwa** for service worker and offline support

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API

This app uses the [node-hnapi](https://github.com/cheeaun/node-hnapi) proxy API at `https://node-hnapi.herokuapp.com`.

## License

MIT
