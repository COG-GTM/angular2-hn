# Angular2-HN

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with Angular that delivers fast, responsive browsing with offline support and modern PWA capabilities.
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">🚀 View Live App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
  <a href="https://travis-ci.org/COG-GTM/angular2-hn"><img alt="Build Status" src="https://travis-ci.org/COG-GTM/angular2-hn.svg?branch=master"></a>
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg">
  <img alt="Angular Version" src="https://img.shields.io/badge/angular-9.0-red.svg">
</p>

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Requirements](#requirements)
- [Project Structure](#project-structure)
- [Development](#development)
- [PWA Features](#pwa-features)
- [Themes](#themes)
- [Testing Service Worker Changes](#testing-service-worker-changes)
- [Contributing](#contributing)
- [License](#license)

## Features

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** [Lighthouse](https://github.com/GoogleChrome/lighthouse) score of 87/100.

:art: **Themeable:** Built-in theme engine with Default, Night, and Black (AMOLED) themes.

:globe_with_meridians: **Offline Support:** Works offline using [Workbox](https://workboxjs.org/) service worker implementation.

<p align="center">
  <img src = "http://i.imgur.com/fzJzLFO.png" width=500>
</p>

## Quick Start

```bash
# Clone the repository
git clone https://github.com/COG-GTM/angular2-hn.git
cd angular2-hn

# Install dependencies
npm install

# Start development server
npm start

# Open your browser to http://localhost:4200
```

For production build:
```bash
# Build for production
npm run build

# Serve production build locally
npm run static-serve
```

## Requirements

- **Node.js:** >= 10.13.0
- **npm:** >= 6.11.0
- **Angular CLI:** ~9.0.2 (installed automatically with dependencies)

## Project Structure

```
angular2-hn/
├── src/
│   ├── app/
│   │   ├── core/                 # Core module (header, footer, settings)
│   │   ├── feeds/                # Feed display components
│   │   │   ├── feed/             # Main feed component with pagination
│   │   │   └── item/             # Individual feed item component
│   │   ├── item-details/         # Story and comment detail views
│   │   │   ├── comment/          # Nested comment component
│   │   │   └── item-details.component.ts
│   │   ├── user/                 # User profile display
│   │   └── shared/               # Shared components and services
│   │       ├── components/       # Reusable UI components
│   │       ├── models/           # TypeScript interfaces and types
│   │       └── services/         # Application services
│   │           ├── hackernews-api.service.ts  # HN API integration
│   │           └── settings.service.ts        # Theme and preferences
│   ├── assets/                   # Static assets and icons
│   ├── environments/             # Environment configurations
│   └── manifest.json             # PWA manifest
├── angular.json                  # Angular CLI configuration
├── ngsw-config.json             # Service Worker configuration
└── package.json                 # Dependencies and scripts
```

## Development

### Available Scripts

- `npm start` - Start development server with hot reload
- `npm run build` - Build for production
- `npm test` - Run unit tests with Karma
- `npm run lint` - Run TSLint code analysis
- `npm run e2e` - Run end-to-end tests with Protractor

### Key Services

**HackerNewsAPIService** - Handles all API communication with the Hacker News API via a Node.js proxy service.

**SettingsService** - Manages application settings including:
- Theme selection (Default, Night, Black/AMOLED)
- Font size preferences
- List spacing options
- System dark mode detection

## PWA Features

### Service Worker
This app uses [Workbox](https://workboxjs.org/) to generate a service worker as part of the build step to load quickly and work offline. The service worker caches the app shell and dynamically caches content for offline access.

### Web App Manifest
With Chromium-based browsers for Android (Chrome, Opera, etc.), Angular2-HN includes a Web App Manifest that allows you to install it to your homescreen for a native app-like experience.

<p align="center">
  <img src = "http://i.imgur.com/1RaaNkr.png">
</p>

### Mobile Preview

<p align="center">
  <img src = "http://i.imgur.com/ZloA1hn.gif">
</p>

### Desktop Preview

<p align="center">
  <img src = "http://i.imgur.com/MrKHaln.gif">
</p>

## Themes

Built-in theme engine with automatic system preference detection!

**Available themes:**
- **Default** - Light theme with orange accents
- **Night** - Dark theme for low-light environments  
- **Black (AMOLED)** - Pure black theme optimized for OLED displays

The app automatically detects your system's dark mode preference and applies the appropriate theme on first visit.

## Testing Service Worker Changes

Service Worker changes are not reflected during local development. To test service worker functionality:

```bash
# Build the application
npm run build

# Generate the service worker file
npm run precache

# Serve with service worker enabled
npm run static-serve
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code style and conventions
- Submitting pull requests
- Testing guidelines

Feel free to [file an issue](https://github.com/COG-GTM/angular2-hn/issues/new) for bug reports or feature requests, or reach out on [Twitter](https://twitter.com/hdjirdeh).

## Areas for Future Development

- Realtime updating using the Firebase SDK
- Server-side rendering implementation
- Additional theme options
- Enhanced accessibility features

## Contributors

A million thanks to these awesome contributors:

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

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

_Originally written and maintained by contributors and [Devin](https://app.devin.ai), with updates from the core team._
