import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrolling; the feed hook scrolls to the top on load.
window.scrollTo = () => {};
