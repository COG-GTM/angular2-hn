# React LoaderComponent

A React functional component that replicates the Angular LoaderComponent from the Angular2-HN application. This component displays an animated loading spinner with three bouncing bars.

## Features

- **Animated Loading Spinner**: Three bouncing bars with smooth CSS animations
- **Responsive Design**: Optimized for both desktop and mobile devices
- **TypeScript Support**: Fully typed with TypeScript interfaces
- **Zero Dependencies**: Pure React component with no external dependencies
- **Customizable**: Accepts optional className prop for additional styling

## Usage

### Basic Import and Usage

```tsx
import React from 'react';
import { LoaderComponent } from './LoaderComponent';

const MyComponent = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div>
      {loading && <LoaderComponent />}
      {/* Your content here */}
    </div>
  );
};
```

### With Custom Styling

```tsx
import { LoaderComponent } from './LoaderComponent';

const MyComponent = () => {
  return (
    <LoaderComponent className="my-custom-loader" />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Optional CSS class name to apply additional styling |

## Component Structure

The component renders the following HTML structure:

```html
<div class="loading-section [custom-class]">
  <div class="loader">
    Loading...
  </div>
</div>
```

## Styling

The component includes comprehensive CSS styling with:

- **Animation**: Smooth bouncing animation using CSS keyframes
- **Responsive Design**: Different sizing and positioning for mobile devices
- **Cross-browser Support**: Includes webkit prefixes for maximum compatibility

### CSS Classes

- `.loading-section`: Container with proper spacing and responsive behavior
- `.loader`: The animated spinner element with bouncing animation

## Migration from Angular

This React component is a direct migration from the Angular LoaderComponent with:

- ✅ Same visual appearance and animation
- ✅ Same responsive behavior
- ✅ Same CSS structure and classes
- ✅ TypeScript support
- ✅ Functional component pattern

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
LoaderComponent/
├── index.ts                    # Main export file
├── LoaderComponent.tsx         # React component
├── LoaderComponent.types.ts    # TypeScript interfaces
├── LoaderComponent.css         # Component styles
├── LoaderComponent.test.html   # Test/demo file
└── README.md                   # This documentation
```

## Testing

Open `LoaderComponent.test.html` in a browser to see the component in action and compare it with the original Angular implementation.

## Example Integration

```tsx
import React, { useState, useEffect } from 'react';
import { LoaderComponent } from './react-components/LoaderComponent';

const DataFetchingComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData()
      .then(result => {
        setData(result);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoaderComponent />;
  }

  return (
    <div>
      {/* Render your data here */}
    </div>
  );
};
```
