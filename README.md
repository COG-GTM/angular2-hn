<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

# Angular 2 HN

A fast, Progressive Web App (PWA) client for Hacker News built with Angular, featuring offline support, installability, and multiple themes including dark mode.

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View Live App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
  <a href="https://travis-ci.org/housseindjirdeh/angular2-hn"><img alt="Build Status" src="https://travis-ci.org/housseindjirdeh/angular2-hn.svg?branch=master"></a>
  <a href="/LICENSE.md"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
</p>

---

## Table of Contents

- [Features](#features)
- [Preview](#preview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Technology Stack](#technology-stack)
- [PWA Features](#pwa-features)
  - [Offline Support](#offline-support)
  - [Install to Home Screen](#install-to-home-screen)
  - [Themes](#themes)
- [Requirements](#requirements)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contributors](#contributors)

---

## Features

:zap: **Fast:** Service Worker with App Shell + Dynamic Content model achieves faster load times with and without a network connection.

:iphone: **Responsive:** Fully responsive UI design that adapts seamlessly from mobile to desktop.

:package: **Installable:** Add to home screen on mobile devices for a native app-like experience.

:art: **Themeable:** Built-in theme engine with Default, Night, and Black (AMOLED) themes.

:rocket: **Progressive:** Optimized [Lighthouse](https://github.com/GoogleChrome/lighthouse) scores for performance and accessibility.

---

## Preview

### Mobile Experience

<p align="center">
  <img src="http://i.imgur.com/ZloA1hn.gif" alt="Mobile preview showing smooth navigation">
</p>

### Desktop Experience

<p align="center">
  <img src="http://i.imgur.com/MrKHaln.gif" alt="Desktop preview showing responsive layout">
</p>

---

## Quick Start

### Prerequisites

- **Node.js**: v14.x or higher (tested with v24.x)
- **npm**: v6.x or higher (or yarn)
- **Git**: For cloning the repository

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/COG-GTM/angular2-hn.git
   cd angular2-hn
   ```

2. **Install dependencies**

   Using npm:
   ```bash
   npm install
   ```

   Or using yarn:
   ```bash
   yarn install
   ```

3. **Start the development server**

   Due to the Angular 9 version and OpenSSL compatibility, you need to set the legacy OpenSSL provider:

   ```bash
   export NODE_OPTIONS=--openssl-legacy-provider && npm start
   ```

   Or with yarn:
   ```bash
   export NODE_OPTIONS=--openssl-legacy-provider && yarn start
   ```

4. **Open in browser**

   Navigate to [http://localhost:4200](http://localhost:4200)

   The app will automatically reload if you make changes to the source files.

---

## Project Structure

```
angular2-hn/
├── e2e/                          # End-to-end tests
├── src/
│   ├── app/
│   │   ├── core/                 # Core module (header, footer, settings)
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   └── settings/
│   │   ├── feeds/                # Feed components (news, show, ask, jobs)
│   │   │   ├── feed/             # Main feed display component
│   │   │   └── item/             # Individual feed item component
│   │   ├── item-details/         # Item details and comment threads
│   │   │   └── comment/          # Nested comment component
│   │   ├── user/                 # User profile module
│   │   ├── shared/               # Shared resources
│   │   │   ├── components/       # Reusable components (loader, error)
│   │   │   ├── models/           # TypeScript interfaces and types
│   │   │   ├── pipes/            # Custom Angular pipes
│   │   │   └── services/         # Core services
│   │   │       ├── hackernews-api.service.ts  # HN API integration
│   │   │       └── settings.service.ts        # App settings management
│   │   ├── app.component.ts      # Root component
│   │   ├── app.module.ts         # Root module
│   │   └── app.routes.ts         # Application routing
│   ├── assets/                   # Static assets (images, icons)
│   ├── environments/             # Environment configurations
│   ├── index.html                # Main HTML file
│   ├── main.ts                   # Application entry point
│   ├── manifest.json             # PWA manifest
│   ├── polyfills.ts              # Browser polyfills
│   └── styles.scss               # Global styles
├── angular.json                  # Angular CLI configuration
├── karma.conf.js                 # Karma test runner config
├── ngsw-config.json             # Service Worker configuration
├── package.json                  # Dependencies and scripts
└── tsconfig.json                # TypeScript configuration
```

---

## Available Scripts

In the project directory, you can run:

### `npm start` or `yarn start`

Runs the app in development mode with live reloading on [http://localhost:4200](http://localhost:4200).

**Note:** You must set the `NODE_OPTIONS` environment variable:
```bash
export NODE_OPTIONS=--openssl-legacy-provider && npm start
```

### `npm run build` or `yarn build`

Builds the app for production to the `dist/` folder. The build is optimized and includes:
- Ahead-of-Time (AOT) compilation
- Tree-shaking for smaller bundles
- Service Worker generation for offline support

### `npm test` or `yarn test`

Launches the Karma test runner in interactive watch mode.

### `npm run lint` or `yarn lint`

Runs TSLint to check code quality and style consistency.

### `npm run e2e` or `yarn e2e`

Runs end-to-end tests using Protractor.

---

## Technology Stack

- **Framework**: [Angular 9.0.1](https://angular.io/)
- **Language**: [TypeScript 3.7.5](https://www.typescriptlang.org/)
- **Styling**: SCSS (Sass)
- **PWA**: [@angular/service-worker](https://angular.io/guide/service-worker-intro)
- **API**: [Hacker News Firebase API](https://github.com/HackerNews/API)
- **Testing**: Jasmine + Karma
- **E2E Testing**: Protractor
- **Build Tool**: Angular CLI
- **Code Quality**: TSLint, Prettier

---

## PWA Features

### Offline Support

This app uses Angular Service Worker (powered by Workbox under the hood) to provide offline functionality:

- **App Shell Caching**: Core application assets are cached on first visit
- **API Response Caching**: Previously viewed content is available offline
- **Background Sync**: Automatic updates when connection is restored

To test service worker functionality in production mode:

```bash
# Build the production app
npm run build

# Serve the built app (requires http-server or similar)
npx http-server dist/angular-hnpwa -p 8080
```

**Note**: Service Worker only works in production builds, not during `npm start`.

### Install to Home Screen

On Android devices with Chrome, Opera, or other Chromium-based browsers, you can install Angular 2 HN to your home screen:

1. Open the app in your mobile browser
2. Tap the menu (⋮) and select "Add to Home screen"
3. The app will be added as a standalone application

<p align="center">
  <img src="http://i.imgur.com/1RaaNkr.png" alt="Install to home screen prompt">
</p>

### Themes

Click the settings icon (⚙️) in the top right to choose from multiple themes:

- **Default**: Classic Hacker News orange
- **Night**: Easy on the eyes in low light
- **Black (AMOLED)**: True black for OLED displays

Theme preference is saved to local storage and persists across sessions. The app also respects your system's dark mode preference.

---

## Requirements

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

### Development Environment

- **Node.js**: v14.x or higher recommended
- **npm**: v6.x or higher (or yarn v1.x)
- Operating Systems: macOS, Linux, Windows

**Important**: Due to Angular 9's age and OpenSSL compatibility requirements, you must use the `NODE_OPTIONS=--openssl-legacy-provider` flag when running the development server.

---

## Testing

### Unit Tests

Run the test suite:

```bash
npm test
```

This executes the unit tests via [Karma](https://karma-runner.github.io).

### End-to-End Tests

Run e2e tests:

```bash
npm run e2e
```

This executes end-to-end tests via [Protractor](http://www.protractortest.org/).

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Code style guidelines
- How to submit pull requests
- Issue reporting guidelines

Feel free to [open an issue](https://github.com/COG-GTM/angular2-hn/issues/new) for bug reports or feature requests.

---

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

Copyright (c) 2017 Houssein Djirdeh

---

## Contributors

A million thanks to these awesome people:

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

---

_Originally written and maintained by contributors and [Devin](https://app.devin.ai), with updates from the core team._
