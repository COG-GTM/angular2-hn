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

:rocket: **Progressive:** Built with modern tooling for optimal performance.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **React Router v6** for client-side routing
- **vite-plugin-pwa** for service worker / PWA support
- **SCSS** for styling with theme engine
- **Firebase Hosting** for deployment

## Features

- Browse HN feeds: news, newest, show, ask, jobs
- View item details and comments (recursive)
- User profiles
- Settings panel with theme switching (Default / Night / Black AMOLED)
- Customizable font size and list spacing
- Open links in new tab toggle
- PWA installable with offline support
- Google Analytics integration

## Themes

Built in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

## Build Process

- Clone or download the repo
- `npm install`
- `npm run dev` to start the development server
- `npm run build` to create a production build in `dist/`
- `npm run preview` to preview the production build locally

## Deployment

This app is configured for Firebase Hosting:

```bash
npm run build
firebase deploy
```

## Component Architecture

```
App.tsx (Router + SettingsProvider + Layout)
├── Header.tsx (nav links, settings toggle)
├── Footer.tsx
├── Settings.tsx (theme/font/spacing controls)
├── Feed.tsx (with useFeed hook)
│   └── Item.tsx
├── ItemDetails.tsx (lazy-loaded)
│   └── Comment.tsx (recursive)
├── User.tsx (lazy-loaded)
├── Loader.tsx
└── ErrorMessage.tsx
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
