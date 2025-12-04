# Angular2-HN Architecture Documentation

This document provides a comprehensive overview of the Angular Hacker News client architecture to facilitate migration to React.

## Application Overview

The Angular2-HN application is a Progressive Web App (PWA) client for Hacker News built with Angular 9. It fetches data from the `https://node-hnapi.herokuapp.com` API and displays stories, comments, jobs, and user profiles.

## Directory Structure

```
src/app/
├── app.component.ts          # Root component
├── app.module.ts             # Root module with providers
├── app.routes.ts             # Application routing configuration
├── core/                     # Core module (singleton components)
│   ├── core.module.ts
│   ├── header/               # Header component with navigation
│   ├── footer/               # Footer component
│   └── settings/             # Settings panel component
├── feeds/                    # Feed display components
│   ├── feed/                 # FeedComponent - displays story lists
│   └── item/                 # ItemComponent - individual story item
├── item-details/             # Item details module (lazy-loaded)
│   ├── item-details.module.ts
│   ├── item-details.component.ts
│   └── comment/              # CommentComponent - recursive comments
├── user/                     # User module (lazy-loaded)
│   ├── user.module.ts
│   └── user.component.ts
└── shared/                   # Shared resources
    ├── components/           # Reusable UI components
    │   ├── loader/           # Loading indicator
    │   └── error-message/    # Error display
    ├── models/               # TypeScript interfaces/classes
    │   ├── story.ts
    │   ├── user.ts
    │   ├── comment.ts
    │   ├── poll-result.ts
    │   ├── feed-type.type.ts
    │   └── settings.ts
    ├── pipes/                # Angular pipes
    │   └── comment.pipe.ts
    └── services/             # Application services
        ├── hackernews-api.service.ts
        └── settings.service.ts
```

## Core Components

### 1. FeedComponent (`src/app/feeds/feed/feed.component.ts`)

Displays paginated lists of stories based on feed type (news, newest, show, ask, jobs).

**Dependencies:**
- `HackerNewsAPIService` - for fetching feed data
- `ActivatedRoute` - for reading route parameters and data

**Key Properties:**
- `items: Story[]` - array of stories to display
- `feedType: string` - type of feed (news, newest, show, ask, jobs)
- `pageNum: number` - current page number
- `listStart: number` - starting index for list numbering
- `errorMessage: string` - error message for failed requests

**Behavior:**
- Subscribes to route data to get feed type
- Subscribes to route params to get page number
- Fetches feed data when route changes
- Calculates list start index based on page number

### 2. ItemComponent (`src/app/feeds/item/item.component.ts`)

Displays individual story items within a feed list.

**Dependencies:**
- `SettingsService` - for accessing user settings

**Inputs:**
- `@Input() item: Story` - the story to display

**Key Properties:**
- `settings: Settings` - reference to app settings
- `hasUrl: boolean` (getter) - checks if item has external URL

### 3. ItemDetailsComponent (`src/app/item-details/item-details.component.ts`)

Displays detailed view of a single story with its comments.

**Dependencies:**
- `HackerNewsAPIService` - for fetching item content
- `SettingsService` - for accessing user settings
- `ActivatedRoute` - for reading item ID from route
- `Location` - for navigation (goBack)

**Key Properties:**
- `item: Story` - the story with comments
- `errorMessage: string` - error message for failed requests
- `settings: Settings` - reference to app settings

**Methods:**
- `goBack()` - navigates to previous page
- `hasUrl` (getter) - checks if item has external URL

### 4. CommentComponent (`src/app/item-details/comment/comment.component.ts`)

Renders individual comments with support for nested replies (recursive structure).

**Inputs:**
- `@Input() comment: Comment` - the comment to display

**Key Properties:**
- `collapse: boolean` - whether the comment is collapsed

### 5. UserComponent (`src/app/user/user.component.ts`)

Displays user profile information.

**Dependencies:**
- `HackerNewsAPIService` - for fetching user data
- `ActivatedRoute` - for reading user ID from route
- `Location` - for navigation (goBack)

**Key Properties:**
- `user: User` - the user profile data
- `errorMessage: string` - error message for failed requests

**Methods:**
- `goBack()` - navigates to previous page

## Services

### 1. HackerNewsAPIService (`src/app/shared/services/hackernews-api.service.ts`)

Handles all API calls to the Hacker News API.

**Base URL:** `https://node-hnapi.herokuapp.com`

**Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `fetchFeed` | `(feedType: string, page: number): Observable<Story[]>` | Fetches paginated feed data |
| `fetchItemContent` | `(id: number): Observable<Story>` | Fetches item details with comments |
| `fetchPollContent` | `(id: number): Observable<PollResult>` | Fetches poll option data |
| `fetchUser` | `(id: string): Observable<User>` | Fetches user profile |

**Implementation Details:**
- Uses `unfetch` library for HTTP requests
- Wraps fetch in RxJS Observable via `lazyFetch` helper function
- Supports request cancellation through Observable unsubscription
- Poll items require additional requests for poll options

### 2. SettingsService (`src/app/shared/services/settings.service.ts`)

Manages user preferences and persists them to localStorage.

**Settings Properties:**
- `showSettings: boolean` - whether settings panel is visible
- `openLinkInNewTab: boolean` - whether to open links in new tab
- `theme: string` - current theme ('default' or 'night')
- `titleFontSize: string` - font size for titles
- `listSpacing: string` - spacing between list items

**Methods:**

| Method | Description |
|--------|-------------|
| `toggleSettings()` | Shows/hides settings panel |
| `toggleOpenLinksInNewTab()` | Toggles new tab preference |
| `setTheme(theme)` | Sets and persists theme |
| `setFont(fontSize)` | Sets and persists font size |
| `setSpacing(listSpace)` | Sets and persists list spacing |
| `initTheme()` | Initializes theme from localStorage or system preference |

**Features:**
- Listens to system color scheme preference changes
- Automatically applies dark theme when system prefers dark mode

## Routing Configuration

The application uses Angular Router with the following routes:

| Path | Component | Lazy Loaded | Description |
|------|-----------|-------------|-------------|
| `/` | - | No | Redirects to `/news/1` |
| `/news/:page` | FeedComponent | No | Top stories feed |
| `/newest/:page` | FeedComponent | No | Newest stories feed |
| `/show/:page` | FeedComponent | No | Show HN stories |
| `/ask/:page` | FeedComponent | No | Ask HN stories |
| `/jobs/:page` | FeedComponent | No | Job postings |
| `/item/:id` | ItemDetailsComponent | Yes | Story details with comments |
| `/user/:id` | UserComponent | Yes | User profile |

**Route Data:**
- Feed routes pass `feedType` via route data to determine which API endpoint to call

## Data Models

### Story
```typescript
class Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: number;
    type: FeedType;
    url: string;
    domain: string;
    comments: Comment[];
    comments_count: number;
    poll: PollResult[];
    poll_votes_count: number;
    deleted: boolean;
    dead: boolean;
}
```

### User
```typescript
class User {
    id: string;
    crated_time: number;  // Note: typo in original
    created: string;
    karma: number;
    avg: number;
    about: string;
}
```

### Comment
```typescript
class Comment {
    id: number;
    level: number;
    user: string;
    time: number;
    time_ago: string;
    content: string;
    deleted: boolean;
    comments: Comment[];  // Recursive structure for nested comments
}
```

### PollResult
```typescript
class PollResult {
    points: number;
    content: string;
}
```

### FeedType
```typescript
type FeedType = 'poll' | 'story' | 'job';
```

### Settings
```typescript
interface Settings {
   showSettings: boolean;
   openLinkInNewTab: boolean;
   theme: string;
   titleFontSize: string;
   listSpacing: string;
}
```

## Component Relationships Diagram

```
AppComponent
├── HeaderComponent
│   └── SettingsComponent (toggle visibility)
├── RouterOutlet
│   ├── FeedComponent (routes: /news, /newest, /show, /ask, /jobs)
│   │   └── ItemComponent (repeated for each story)
│   ├── ItemDetailsComponent (route: /item/:id) [lazy-loaded]
│   │   └── CommentComponent (recursive for nested comments)
│   └── UserComponent (route: /user/:id) [lazy-loaded]
└── FooterComponent
```

## Service Dependencies

```
HackerNewsAPIService
├── FeedComponent (fetchFeed)
├── ItemDetailsComponent (fetchItemContent, fetchPollContent)
└── UserComponent (fetchUser)

SettingsService
├── HeaderComponent (toggleSettings)
├── SettingsComponent (all settings methods)
├── ItemComponent (read settings)
└── ItemDetailsComponent (read settings)
```

## Migration Considerations

### Angular to React Mapping

| Angular Concept | React Equivalent |
|-----------------|------------------|
| Components | Functional Components |
| Services (DI) | Context API / Custom Hooks |
| RxJS Observables | React Query / Promises |
| Angular Router | React Router |
| @Input() | Props |
| ngOnInit | useEffect |
| Subscriptions | useQuery / useEffect cleanup |
| Pipes | Utility functions |
| Modules | Not needed (tree-shaking) |

### Key Migration Tasks

1. **Data Fetching**: Replace RxJS Observables with React Query for caching, refetching, and loading states
2. **Routing**: Convert Angular routes to React Router v6 routes
3. **State Management**: Use React Context for settings, React Query for server state
4. **Component Structure**: Convert class components to functional components with hooks
5. **Type Definitions**: Reuse existing TypeScript interfaces (convert classes to interfaces)
