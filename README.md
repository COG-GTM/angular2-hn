<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="React HN" title="React HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React, TypeScript, and Vite
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

---

:zap: **Fast:** Vite-powered build with PWA service worker for instant loading and offline support.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** Service Worker with Workbox precaching and runtime API caching.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for blazing-fast dev server and optimized builds
- **React Router v6** with lazy-loaded routes
- **Sass/SCSS** for styling with theme engine
- **vite-plugin-pwa** for service worker generation via Workbox
- **Vitest** + React Testing Library for testing
- **Firebase Hosting** for deployment

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

# Type check
npm run typecheck
```

## Themes

Built-in theme engine with three themes:
* Default (light)
* Night (dark)
* Black (AMOLED)

## Offline Support

This app uses [Workbox](https://workboxjs.org/) via `vite-plugin-pwa` to generate a service worker that precaches the app shell and provides runtime caching for the HN API.

## Manifest

With Chromium-based browsers for Android (Chrome, Opera, etc.), this app includes a Web App Manifest for home screen installation.

## Project Structure

```
src/
├── components/    # Reusable UI components (Header, Footer, Settings, etc.)
├── contexts/      # React Context providers (SettingsContext)
├── models/        # TypeScript interfaces (Story, User, Comment, etc.)
├── pages/         # Route-level page components (FeedPage, ItemDetailsPage, UserPage)
├── scss/          # Global SCSS themes and variables
├── services/      # API service (hackerNewsApi)
├── utils/         # Utility functions (commentPipe)
├── main.tsx       # App entry point
├── router.tsx     # React Router configuration
└── styles.scss    # Global styles
```

## Contributors

A million thanks to some awesome people :)

* [Ashwin Sureshkumar](https://github.com/ashwin-sureshkumar)
* [Mateusz](https://github.com/mateuszwitkowski)
* [Jordi Collell](https://github.com/jordic)
* [Ben Brooks](https://github.com/bbrks)
* [Zach Berger](https://github.com/zachberger)
* [blAck PR](https://github.com/blackpr)
* [Bram Borggreve](https://github.com/beeman)
* [Antonio Indrianjafy](https://github.com/Antogin)
* [Addy Osmani](https://github.com/addyosmani)
* [Majid Hajian](https://github.com/mhadaily)
* [Jeff Cross](https://github.com/jeffbcross)
* [Minko Gechev](https://github.com/mgechev)
