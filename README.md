# Angular 2 HN

A progressive Hacker News client built with React, TypeScript, and Vite.

The app provides Hacker News feeds, item details, comments, user pages, configurable themes, and an installable PWA experience.

## Features

- Responsive layouts for mobile and laptop screens.
- News, newest, show, ask, and jobs feeds.
- Item comments and user profile views.
- Default, night, and AMOLED black themes.
- Workbox-powered service worker and web app manifest generated during the Vite build.

## Prerequisites

- Node.js 20 or newer
- npm

## Development

From the repository root:

```sh
cd react-app
npm install
npm run dev
```

The development server runs at [http://localhost:5173](http://localhost:5173).

## Build and verification

Run these commands from `react-app/`:

```sh
npm run build
npm run preview
npm run lint
npm test
npm run format
npm run format:check
```

`npm run build` creates the production bundle in `react-app/dist`. `npm run preview` serves that bundle locally.

## Progressive Web App

The production build uses `vite-plugin-pwa` and Workbox to generate the service worker and web app manifest. The generated app can be installed from browsers that support Progressive Web Apps.

## Firebase deployment

Firebase Hosting serves `react-app/dist` and rewrites application routes to the React entry point. To deploy manually after building:

```sh
cd react-app
npm run build
cd ..
firebase deploy --token "$FIREBASE_TOKEN"
```

Continuous integration runs the React lint, test, and build commands before deploying successful builds from the configured branch.

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
