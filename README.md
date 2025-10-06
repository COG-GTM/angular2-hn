# Angular 2 HN

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A Progressive Web App (PWA) client for Hacker News built with Angular 9, featuring offline support, multiple themes, and mobile installation.
</p>

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

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Testing Service Worker](#testing-service-worker)
- [Compatibility](#compatibility)
- [Themes](#themes)
- [Contributing](#contributing)
- [License](#license)
- [Contributors](#contributors)

---

## Overview

Angular 2 HN is a Progressive Web App that brings the Hacker News experience to modern web browsers with enhanced performance, offline capabilities, and native-like mobile installation. Browse stories, comments, jobs, and user profiles with a fast, responsive interface optimized for all devices.

**Live Demo:** [angular2-hn.firebaseapp.com](https://angular2-hn.firebaseapp.com)

## Features

:zap: **Fast Performance**  
Service Worker App Shell + Dynamic Content model delivers sub-second load times with or without network connectivity.

:iphone: **Mobile-First & Responsive**  
Fully responsive UI that can be installed to your mobile home screen for a native app experience.

:crescent_moon: **Theme Engine**  
Built-in theme support with Default, Night, and AMOLED Black modes.

:signal_strength: **Offline Support**  
Uses [Workbox](https://workboxjs.org/) to generate a service worker for reliable offline functionality.

:rocket: **Progressive**  
High [Lighthouse](https://github.com/GoogleChrome/lighthouse) performance scores and PWA compliance.

:inbox_tray: **Installable**  
Web App Manifest enables installation on Android (Chrome, Opera) and other Chromium-based browsers.

<p align="center">
  <img src="http://i.imgur.com/fzJzLFO.png" width="500" alt="Lighthouse scores">
</p>

### Preview

<details>
<summary>Mobile Preview</summary>
<p align="center">
  <img src="http://i.imgur.com/ZloA1hn.gif" alt="Mobile preview">
</p>
</details>

<details>
<summary>Desktop Preview</summary>
<p align="center">
  <img src="http://i.imgur.com/MrKHaln.gif" alt="Desktop preview">
</p>
</details>

<details>
<summary>Install to Homescreen</summary>
<p align="center">
  <img src="http://i.imgur.com/1RaaNkr.png" alt="Install to homescreen">
</p>
</details>

---

## Quick Start

### Prerequisites

- **Node.js**: Version 12.x or higher recommended
- **npm**: Version 6.x or higher (comes with Node.js)
- **Angular CLI**: Install globally if not already installed

### Installation

```bash
git clone https://github.com/COG-GTM/angular2-hn.git
cd angular2-hn
npm install
```

### Run Development Server

```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm start
```

The application will be available at `http://localhost:4200/`. The dev server will automatically reload when you make changes to source files.

**Using yarn:**

```bash
export NODE_OPTIONS=--openssl-legacy-provider
yarn start
```

**Note:** The `NODE_OPTIONS=--openssl-legacy-provider` flag is required for compatibility with older OpenSSL versions used by this Angular version.

---

## Project Structure

```
angular2-hn/
├── src/
│   ├── app/
│   │   ├── core/              # Singleton services, header, footer, settings
│   │   ├── feeds/             # Feed list and item components
│   │   ├── item-details/      # Story/job details and comments
│   │   ├── user/              # User profile display
│   │   ├── shared/            # Shared components, services, models, pipes
│   │   │   ├── components/    # Reusable UI components (loader, error-message)
│   │   │   ├── models/        # TypeScript interfaces and types
│   │   │   ├── pipes/         # Custom Angular pipes
│   │   │   └── services/      # HackerNewsAPIService, SettingsService
│   │   ├── app.component.ts   # Root component
│   │   ├── app.module.ts      # Root module
│   │   └── app.routes.ts      # Application routing configuration
│   ├── assets/                # Static assets (images, icons)
│   ├── environments/          # Environment-specific configurations
│   ├── index.html             # Main HTML entry point
│   ├── main.ts                # Application bootstrap
│   ├── manifest.json          # PWA manifest
│   └── styles.scss            # Global styles
├── e2e/                       # End-to-end tests
├── angular.json               # Angular CLI configuration
├── karma.conf.js              # Karma test runner configuration
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

**Key Services:**

- **HackerNewsAPIService** (`src/app/shared/services/hackernews-api.service.ts`): Fetches data from the Hacker News API
- **SettingsService** (`src/app/shared/services/settings.service.ts`): Manages user preferences and theme switching

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on `localhost:4200` |
| `npm run build` | Build the project for production |
| `npm test` | Run unit tests with Karma |
| `npm run lint` | Run TSLint on the project |
| `npm run e2e` | Run end-to-end tests with Protractor |

### Code Style

This project uses [Prettier](https://prettier.io/) for code formatting. Configuration is defined in `package.json`:

- Single quotes
- Tab width: 4 spaces
- Print width: 120 characters
- Trailing commas: ES5

---

## Building for Production

To create a production-ready build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory. The production build includes:

- Ahead-of-Time (AOT) compilation
- Tree shaking and dead code elimination
- Service Worker generation for offline support
- Optimized bundle sizes with code splitting

---

## Testing Service Worker

Service Worker changes are only reflected in production builds. To test Service Worker functionality:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Generate the Service Worker:**
   ```bash
   npm run precache
   ```

3. **Serve the production build:**
   ```bash
   npm run static-serve
   ```

The application will be served with the Service Worker enabled using [live-server](https://github.com/tapio/live-server).

---

## Compatibility

### Framework & Dependencies

- **Angular**: 9.0.1
- **TypeScript**: 3.7.5
- **RxJS**: 6.5.4
- **Service Worker**: @angular/service-worker 9.0.1

### Browser Support

This application supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (Chromium-based)
- Opera (latest)

For the best experience and PWA features (installation, offline support), use Chromium-based browsers.

### Node.js Compatibility

- **Recommended**: Node.js 12.x or higher
- **npm**: 6.x or higher

**Important:** Due to OpenSSL compatibility requirements with Angular 9 and Node.js 17+, you must set the `NODE_OPTIONS=--openssl-legacy-provider` environment variable when running the development server.

---

## Themes

Angular 2 HN includes a built-in theme engine with three color schemes:

- **Default**: Classic Hacker News orange theme
- **Night**: Dark mode with blue accents
- **Black (AMOLED)**: Pure black background for OLED displays

Themes can be switched via the settings panel. Your preference is saved in local storage and persists across sessions.

---

## Contributing

Contributions are welcome! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Coding standards and conventions
- Submitting pull requests
- Testing requirements

Feel free to [open an issue](https://github.com/COG-GTM/angular2-hn/issues/new) for bug reports, feature requests, or questions.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE.md](LICENSE.md) file for full details.

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
