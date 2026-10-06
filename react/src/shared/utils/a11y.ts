import type { KeyboardEvent } from 'react';

/** Keyboard handler that triggers `action` on Enter/Space, for non-button elements with role="button". */
export function onActivateKey(action: () => void) {
    return (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            action();
        }
    };
}
