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

:rocket: **Progressive:** Built with Vite + vite-plugin-pwa for optimal performance.

## Tech Stack

- **React 19** with TypeScript 5.5
- **Vite** for development and production builds
- **React Router** for client-side routing with code splitting
- **SCSS Modules** for component-scoped styling
- **vite-plugin-pwa** with Workbox for service worker and offline support
- **Firebase Hosting** for deployment

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck
```

## Project Structure

```
src/
  components/      # Shared UI components (Loader, ErrorMessage)
  contexts/        # React contexts (SettingsContext)
  core/            # App shell (Header, Footer, Settings)
  features/
    feed/           # Feed listing pages
    item-details/   # Item detail / comment thread
    user/           # User profile
  hooks/            # API functions
  styles/           # Global SCSS and theme engine
  types/            # TypeScript interfaces
  utils/            # Utility functions
```

## Offline Support

This app uses [Workbox](https://workboxjs.org/) via vite-plugin-pwa to generate a service worker that precaches app shell assets and provides NetworkFirst caching for API requests.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), React HN includes a Web App Manifest that allows you to install to your homescreen.

## Themes

Built in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

More to come!

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
