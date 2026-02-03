# React Components for Angular2-HN Migration

This directory contains React components migrated from the Angular 9 Hacker News application as part of Phase 1 and Phase 2 of the migration plan.

## Prerequisites

To use these components, you'll need to install the following dependencies:

```bash
npm install react react-dom react-router-dom
npm install -D @types/react @types/react-dom
```

## Directory Structure

```
src/react/
├── contexts/
│   └── SettingsContext.tsx    # React Context for settings state management
├── components/
│   ├── shared/
│   │   ├── Loader/            # Loading indicator component
│   │   └── ErrorMessage/      # Error message display component
│   ├── feeds/
│   │   └── Item/              # Story card component
│   └── core/
│       ├── Footer/            # Footer component
│       ├── Header/            # Navigation header component
│       └── Settings/          # Settings panel component
├── types/
│   └── index.ts               # TypeScript interfaces
├── utils/
│   └── formatComment.ts       # Comment formatting utility
├── index.ts                   # Main exports
├── tsconfig.json              # TypeScript configuration for React
└── README.md                  # This file
```

## Components

### Phase 1: Shared/Utility Components

#### Loader
A pure presentational component that displays a loading animation.

```tsx
import { Loader } from './react';

<Loader />
```

#### ErrorMessage
A presentational component that displays error messages with a skull icon.

```tsx
import { ErrorMessage } from './react';

<ErrorMessage message="Something went wrong!" />
```

#### Item
A story card component that displays individual Hacker News items.

```tsx
import { Item } from './react';
import { Story } from './react/types';

const story: Story = { /* ... */ };
<Item item={story} />
```

### Phase 2: Core Layout Components

#### Footer
A static footer component with a GitHub link.

```tsx
import { Footer } from './react';

<Footer />
```

#### Header
A navigation header component with links and settings toggle.

```tsx
import { Header } from './react';

<Header />
```

#### Settings
A settings panel component for configuring app preferences.

```tsx
import { Settings } from './react';

<Settings />
```

## Context Provider

The `SettingsProvider` must wrap your application to provide settings state to all components:

```tsx
import { SettingsProvider } from './react';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        {/* Your app components */}
      </SettingsProvider>
    </BrowserRouter>
  );
}
```

## Settings Context

The settings context provides the following state and methods:

- `settings`: Current settings object
  - `showSettings`: boolean - Whether settings panel is visible
  - `openLinkInNewTab`: boolean - Whether to open links in new tab
  - `theme`: 'default' | 'night' | 'amoledblack' - Current theme
  - `titleFontSize`: string - Font size for titles
  - `listSpacing`: string - Spacing between list items

- `toggleSettings()`: Toggle settings panel visibility
- `toggleOpenLinksInNewTab()`: Toggle link behavior
- `setTheme(theme)`: Set the current theme
- `setFont(fontSize)`: Set the title font size
- `setSpacing(listSpacing)`: Set the list spacing

## Migration Notes

These components are designed to run alongside the existing Angular components during the incremental migration process. The CSS styles have been converted from SCSS to plain CSS to work independently.

The `SettingsService` from Angular has been converted to a React Context (`SettingsContext`) that provides the same functionality using React hooks.
