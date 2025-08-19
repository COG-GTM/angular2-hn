# Angular2-HN

A progressive Hacker News client built with Angular that delivers a fast, responsive, and feature-rich experience for browsing Hacker News content.

[![Build Status](https://travis-ci.org/COG-GTM/angular2-hn.svg?branch=master)](https://travis-ci.org/COG-GTM/angular2-hn)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](/CONTRIBUTING.md)

[**🚀 View Live App**](https://angular2-hn.firebaseapp.com)

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [PWA Features](#pwa-features)
- [Themes](#themes)
- [Browser Support](#browser-support)
- [Contributing](#contributing)
- [License](#license)

---

## Features

⚡ **Fast Performance**: Service Worker App Shell + Dynamic Content model for faster load times  
📱 **Mobile Ready**: Fully responsive design that can be installed on mobile home screens  
🌙 **Multiple Themes**: Built-in theme engine with Default, Night, and AMOLED Black themes  
🔄 **Offline Support**: Works offline with cached content using Workbox service workers  
⚙️ **Customizable**: Adjustable font sizes, list spacing, and link behavior  
🎯 **Progressive**: [Lighthouse](https://github.com/GoogleChrome/lighthouse) score of 87/100 with PWA capabilities  

---

## Quick Start

### Prerequisites

- **Node.js**: 12.x or higher
- **npm**: 6.x or higher (or **yarn**: 1.x)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/COG-GTM/angular2-hn.git
   cd angular2-hn
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

### Production Build

```bash
# Build for production
npm run build

# Serve production build locally
npm run build && npx http-server dist/angular-hnpwa
```

---

## Project Structure

```
angular2-hn/
├── src/
│   ├── app/
│   │   ├── core/                    # Core module (header, footer, settings)
│   │   │   ├── header/              # Navigation header component
│   │   │   ├── footer/              # Footer component
│   │   │   └── settings/            # Settings panel component
│   │   ├── feeds/                   # Feed display components
│   │   │   ├── feed/                # Main feed component
│   │   │   └── item/                # Individual story item component
│   │   ├── item-details/            # Story and comment details
│   │   │   └── comment/             # Nested comment component
│   │   ├── user/                    # User profile display
│   │   └── shared/                  # Shared components and services
│   │       ├── components/          # Reusable UI components
│   │       ├── models/              # TypeScript interfaces
│   │       ├── services/            # Application services
│   │       └── scss/                # Shared styles and themes
│   ├── assets/                      # Static assets and icons
│   ├── environments/                # Environment configurations
│   └── manifest.json                # PWA manifest
├── angular.json                     # Angular CLI configuration
├── ngsw-config.json                 # Service Worker configuration
└── package.json                     # Dependencies and scripts
```

### Key Components

- **FeedComponent**: Displays different types of Hacker News feeds (news, newest, show, ask, jobs)
- **ItemComponent**: Renders individual story items with customizable styling
- **SettingsComponent**: Manages user preferences and theme selection
- **HackerNewsAPIService**: Handles API communication with Hacker News backend
- **SettingsService**: Manages application settings and theme persistence

---

## Development

### Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run unit tests
npm run lint       # Run linting
npm run e2e        # Run end-to-end tests
```

### Development Server

The development server runs on `http://localhost:4200` with hot reload enabled. The app will automatically reload when you make changes to the source files.

### Testing Service Worker Changes

Service Worker changes are not reflected in development mode. To test PWA features:

1. Build the application: `npm run build`
2. Serve the production build: `npx http-server dist/angular-hnpwa`
3. Open `http://localhost:8080` to test offline capabilities

---

## PWA Features

### Service Worker

Angular2-HN uses Angular's built-in Service Worker implementation with custom caching strategies:

- **App Shell**: Critical app resources are cached for instant loading
- **Dynamic Content**: Hacker News API responses are cached with network-first strategy
- **Offline Support**: Previously viewed content remains accessible offline

### Web App Manifest

The app includes a Web App Manifest that enables:

- **Add to Home Screen**: Install the app on mobile devices
- **Standalone Mode**: Runs in full-screen mode without browser UI
- **Custom Icons**: Branded app icons for different screen sizes
- **Theme Colors**: Consistent branding across the system UI

---

## Themes

Angular2-HN features a built-in theme engine with automatic system preference detection:

### Available Themes

- **Default**: Light theme with orange accents
- **Night**: Dark theme for low-light environments  
- **AMOLED Black**: Pure black theme optimized for OLED displays

### Theme Features

- **Automatic Detection**: Respects system dark mode preferences
- **Persistent Settings**: Theme choice is saved in localStorage
- **Smooth Transitions**: CSS transitions between theme changes
- **Customizable**: Easy to add new themes via SCSS variables

---

## Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 11+
- **Edge**: 79+

### PWA Support

- **Service Workers**: Chrome 45+, Firefox 44+, Safari 11.1+
- **Web App Manifest**: Chrome 39+, Firefox 53+, Safari 11.3+

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test them
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Setup

Please refer to the [Contributing Guide](CONTRIBUTING.md) for detailed setup instructions and development guidelines.

---

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## Acknowledgments

- **Hacker News API**: Thanks to the Hacker News team for providing the API
- **Angular Team**: For the excellent framework and PWA tools
- **Contributors**: Special thanks to all [contributors](https://github.com/COG-GTM/angular2-hn#contributors) who have helped improve this project

---

*Originally written and maintained by contributors and [Devin](https://app.devin.ai), with updates from the core team.*
