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

:rocket: **Progressive:** Built with PWA best practices using Workbox service workers.

## Features

- **All Feed Types**: News, Newest, Show, Ask, Jobs
- **Item Details**: Full story view with polls support
- **Recursive Comments**: Threaded comment display with collapse/expand
- **User Profiles**: Karma, creation date, and about section
- **Theme Engine**: Default, Night, and Black (AMOLED) themes
- **Settings Panel**: Configurable font size, link behavior, list spacing
- **PWA Support**: Service worker with offline capabilities
- **Responsive Design**: Mobile-first responsive layout
- **Google Analytics**: Page view tracking on route changes
- **Code Splitting**: Lazy-loaded routes for ItemDetails and UserProfile

## Tech Stack

- **React 18** with TypeScript
- **React Router v6** for client-side routing
- **Sass/SCSS** for styling with theme engine
- **Workbox** for service worker / PWA support
- **Jest + React Testing Library** for testing
- **Create React App** as the build toolchain

## Build Process

```bash
cd react-hn

# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Create production build
npm run build

# Type check
npm run lint
```

## Offline Support

This app uses [Workbox](https://workboxjs.org/) to generate a service worker as part of the build step to load quickly and work offline.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), React HN includes a Web App Manifest that allows you to install to your homescreen.

## Themes

Built in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

## Project Structure

```
react-hn/
  public/           # Static assets, manifest, index.html
  src/
    components/     # React components (App, Header, Feed, Item, etc.)
    context/        # React Context (SettingsContext)
    models/         # TypeScript interfaces
    services/       # API service (hackernews-api)
    utils/          # Utility functions (formatComments)
    scss/           # SCSS theme files
    __tests__/      # Test files
```

## Firebase Hosting

Deploy to Firebase:

```bash
cd react-hn && npm run build
firebase deploy
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
