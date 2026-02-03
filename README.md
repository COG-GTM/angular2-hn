# Angular Hacker News PWA

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular HN" title="Angular HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with Angular
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View Live App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
  <a href="https://travis-ci.org/housseindjirdeh/angular2-hn"><img alt="Build Status" src="https://travis-ci.org/housseindjirdeh/angular2-hn.svg?branch=master"></a>
  <img alt="Angular" src="https://img.shields.io/badge/Angular-9.0-red.svg">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg">
</p>

---

## Overview

Angular Hacker News PWA is a progressive web application that provides a fast, responsive, and offline-capable interface for browsing Hacker News content. Built with Angular 9, it leverages modern web technologies to deliver a native-like experience on both desktop and mobile devices.

### Key Features

**Fast Performance**: Service Worker App Shell combined with a dynamic content model achieves faster load times with and without a network connection.

**Responsive Design**: A completely responsive UI that adapts seamlessly to any screen size, from mobile phones to large desktop monitors.

**Progressive Web App**: Achieves a Lighthouse score of 87/100 and can be installed to your mobile home screen for a native app-like experience.

**Offline Support**: Uses service workers to cache content and provide offline functionality, allowing you to browse previously loaded content without an internet connection.

**Theme Support**: Built-in theme engine with multiple themes including Default, Night, and Black (AMOLED-friendly).

<p align="center">
  <img src="http://i.imgur.com/fzJzLFO.png" width="500">
</p>

## Demo

### Mobile Preview

<p align="center">
  <img src="http://i.imgur.com/ZloA1hn.gif">
</p>

### Desktop Preview

<p align="center">
  <img src="http://i.imgur.com/MrKHaln.gif">
</p>

## Technology Stack

This project is built with the following technologies:

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 9.0.1 | Frontend framework |
| TypeScript | 3.7.5 | Programming language |
| RxJS | 6.5.4 | Reactive programming |
| Angular Service Worker | 9.0.1 | PWA/offline support |
| SCSS | - | Styling |
| Karma/Jasmine | - | Unit testing |
| Protractor | 5.4.0 | E2E testing |
| Firebase | - | Hosting |

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 12.x or higher
- **npm**: Version 6.x or higher (comes with Node.js)
- **Angular CLI**: Version 9.x (`npm install -g @angular/cli@9`)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/COG-GTM/angular2-hn.git
cd angular2-hn
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:4200`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the development server at `localhost:4200` |
| `npm run build` | Build the application for production |
| `npm test` | Run unit tests with Karma |
| `npm run lint` | Run TSLint for code quality checks |
| `npm run e2e` | Run end-to-end tests with Protractor |

## Project Structure

```
angular2-hn/
├── src/
│   ├── app/
│   │   ├── core/                    # Core module (header, footer, settings)
│   │   │   ├── footer/
│   │   │   ├── header/
│   │   │   └── settings/
│   │   ├── feeds/                   # Feed-related components
│   │   │   ├── feed/                # Main feed list component
│   │   │   └── item/                # Individual feed item component
│   │   ├── item-details/            # Item details with comments (lazy-loaded)
│   │   │   └── comment/
│   │   ├── user/                    # User profile (lazy-loaded)
│   │   ├── shared/                  # Shared resources
│   │   │   ├── components/          # Reusable components
│   │   │   ├── models/              # TypeScript interfaces/models
│   │   │   ├── pipes/               # Custom pipes
│   │   │   ├── scss/                # Shared styles
│   │   │   └── services/            # API and utility services
│   │   ├── app.component.ts         # Root component
│   │   ├── app.module.ts            # Root module
│   │   └── app.routes.ts            # Application routing
│   ├── assets/                      # Static assets
│   ├── environments/                # Environment configurations
│   └── index.html                   # Main HTML file
├── e2e/                             # End-to-end tests
├── angular.json                     # Angular CLI configuration
├── firebase.json                    # Firebase hosting configuration
├── karma.conf.js                    # Karma test configuration
├── package.json                     # Project dependencies
└── tsconfig.json                    # TypeScript configuration
```

## Application Routes

The application supports the following routes:

| Route | Description |
|-------|-------------|
| `/news/:page` | Top stories from Hacker News |
| `/newest/:page` | Most recent stories |
| `/show/:page` | Show HN submissions |
| `/ask/:page` | Ask HN questions |
| `/jobs/:page` | Job postings |
| `/item/:id` | Individual story with comments |
| `/user/:id` | User profile page |

## API

This application uses the [node-hnapi](https://github.com/cheeaun/node-hnapi) as its backend API, which provides a clean REST interface to Hacker News data.

**Base URL**: `https://node-hnapi.herokuapp.com`

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `/{feed}?page={n}` | Get feed items (news, newest, show, ask, jobs) |
| `/item/{id}` | Get item details with comments |
| `/user/{id}` | Get user profile |

## PWA Features

### Service Worker

The application uses Angular's built-in service worker (`@angular/service-worker`) to provide offline capabilities. The service worker configuration is defined in `ngsw-config.json`.

### Web App Manifest

With Chromium-based browsers for Android (Chrome, Opera, etc.), the application includes a Web App Manifest that allows installation to your home screen.

<p align="center">
  <img src="http://i.imgur.com/1RaaNkr.png">
</p>

## Themes

The application includes a built-in theme engine with the following themes:

- **Default**: Light theme with orange accents
- **Night**: Dark theme for low-light environments
- **Black**: Pure black theme optimized for AMOLED displays

## Testing

### Unit Tests

Run unit tests with Karma:
```bash
npm test
```

### End-to-End Tests

Run E2E tests with Protractor:
```bash
npm run e2e
```

## Deployment

The application is configured for deployment to Firebase Hosting.

### Deploy to Firebase

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Build the application:
```bash
npm run build
```

4. Deploy:
```bash
firebase deploy
```

### CI/CD

The project uses Travis CI for continuous integration and deployment. On every push to the `master` branch, Travis CI will build the application and deploy to Firebase Hosting if the build succeeds.

## Areas for Improvement

- Realtime updating using the Firebase SDK
- Server-side rendering for improved SEO and initial load performance

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contributors

A million thanks to these awesome people:

- [Ashwin Sureshkumar](https://github.com/ashwin-sureshkumar)
- [Mateusz](https://github.com/mateuszwitkowski)
- [Jordi Collell](https://github.com/jordic)
- [Ben Brooks](https://github.com/bbrks)
- [Zach Berger](https://github.com/zachberger)
- [blAck PR](https://github.com/blackpr)
- [Bram Borggreve](https://github.com/beeman)
- [Antonio Indrianjafy](https://github.com/Antogin)
- [Addy Osmani](https://github.com/addyosmani)
- [Majid Hajian](https://github.com/mhadaily)
- [Jeff Cross](https://github.com/jeffbcross)
- [Minko Gechev](https://github.com/mgechev)

## Feedback

Feel free to send feedback on [Twitter](https://twitter.com/hdjirdeh) or [file an issue](https://github.com/COG-GTM/angular2-hn/issues/new). Feature requests are always welcome!
