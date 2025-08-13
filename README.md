# Angular2-HN

A progressive Hacker News client built with Angular 9, featuring offline support, responsive design, and installable PWA capabilities.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Building for Production](#building-for-production)
- [PWA Features](#pwa-features)
- [Themes](#themes)
- [Browser Compatibility](#browser-compatibility)
- [Contributing](#contributing)
- [License](#license)

## Features

- **⚡ Fast**: Service Worker App Shell + Dynamic Content model for faster load times
- **📱 Responsive**: Completely responsive UI installable to mobile home screen
- **🚀 Progressive**: Optimized PWA with offline support
- **🎨 Themeable**: Built-in theme engine with Dark mode and system preference detection
- **🔧 Customizable**: Adjustable font sizes, list spacing, and link behavior

## Quick Start

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/COG-GTM/angular2-hn.git
cd angular2-hn

# Install dependencies
npm install

# Start development server
export NODE_OPTIONS=--openssl-legacy-provider && npm start

# Open your browser to http://localhost:4200
```

### Alternative with yarn

```bash
yarn install
export NODE_OPTIONS=--openssl-legacy-provider && yarn start
```

## Project Structure

```
angular2-hn/
├── src/
│   ├── app/
│   │   ├── core/                 # Core module (header, footer, settings)
│   │   ├── feeds/                # Feed display components
│   │   ├── item-details/         # Item and comment display
│   │   ├── user/                 # User profile display
│   │   └── shared/               # Shared components, services, models
│   │       ├── components/       # Reusable UI components
│   │       ├── models/           # Data models (Story, User, Comment, etc.)
│   │       ├── pipes/            # Custom Angular pipes
│   │       └── services/         # Application services
│   │           ├── hackernews-api.service.ts  # API service
│   │           └── settings.service.ts        # Settings service
│   ├── assets/                   # Static assets
│   ├── environments/             # Environment configurations
│   └── manifest.json             # PWA manifest
├── angular.json                  # Angular CLI configuration
├── ngsw-config.json             # Service Worker configuration
└── firebase.json                # Firebase hosting configuration
```

## Development

### Available Scripts

```bash
# Development server
npm start                 # Starts dev server on http://localhost:4200

# Building
npm run build            # Build for production
npm run build -- --prod # Build with production optimizations

# Testing
npm test                 # Run unit tests
npm run e2e             # Run end-to-end tests

# Linting
npm run lint            # Run TSLint
```

### Development Notes

- The app uses Angular 9 with TypeScript
- Service Worker changes are not reflected in development mode
- Uses RxJS for reactive data handling
- Implements lazy loading for optimal performance

## Building for Production

```bash
# Build the application
npm run build

# The build artifacts will be stored in the `dist/` directory
```

### Testing Service Worker Changes

```bash
# Build the application
npm run build

# Serve the built application with Service Worker
npx http-server dist/angular-hnpwa -p 8080
```

## PWA Features

### Service Worker

This app uses Angular's built-in Service Worker implementation for:
- App shell caching
- Dynamic content caching
- Offline functionality
- Background sync

### Web App Manifest

The app includes a Web App Manifest that allows installation on:
- Android devices (Chrome, Opera, Samsung Internet)
- iOS devices (Safari - Add to Home Screen)
- Desktop browsers (Chrome, Edge, Firefox)

### Offline Support

- Core app functionality works offline
- Cached content is available without network
- Background sync for when connectivity returns

## Themes

Built-in theme engine with support for:

- **Default**: Light theme with orange accents
- **Night**: Dark theme for low-light environments  
- **Black (AMOLED)**: Pure black theme for OLED displays
- **System**: Automatically follows system dark/light mode preference

Themes are persisted in localStorage and can be changed via the settings panel.

## Browser Compatibility

### Supported Browsers

- **Desktop**: Chrome 55+, Firefox 52+, Safari 10+, Edge 13+
- **Mobile**: iOS 10+, Android Chrome 55+, Samsung Internet 6.2+

### Required Features

- ES6 support
- Service Workers
- Web App Manifest
- Local Storage

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

_Originally written and maintained by contributors and [Devin](https://app.devin.ai), with updates from the core team._
