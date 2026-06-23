<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="React HN" title="React HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

---

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** Built as a PWA with offline support via Workbox.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast builds and dev server
- **React Router v6** for client-side routing
- **Sass** for styling with theming support
- **vite-plugin-pwa** (Workbox) for service worker generation

## Features

- Feed browsing: news, newest, show, ask, jobs
- Item detail with nested comment trees
- User profiles
- Theming: Default, Night, Black (AMOLED)
- Settings panel with font size, spacing, and link behavior controls
- PWA: installable, offline-capable, service worker caching

## Build Process

- Clone or download the repo
- `npm install`
- `npm run dev` to start the Vite dev server
- `npm run build` to create a production build in `dist/`
- `npm run preview` to preview the production build locally

## Offline Support

This app uses [Workbox](https://workboxjs.org/) (via vite-plugin-pwa) to generate a service worker that caches the app shell and API responses for offline use.

## Manifest

With Chromium-based browsers for Android (Chrome, Opera, etc.), React HN includes a Web App Manifest that allows you to install to your homescreen.

## Themes

Built-in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

## Project Structure

```
src/
├── api/            # API layer (hackernews.ts)
├── components/     # Reusable UI components
├── context/        # React Context (Settings)
├── pages/          # Route-level page components
├── styles/         # Global SCSS, themes, variables
├── types/          # TypeScript interfaces
├── utils/          # Utility functions
├── App.tsx         # Root component with routing
└── main.tsx        # Entry point
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
