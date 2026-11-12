import type { KeyboardEvent } from 'react';

// Keyboard activation for span-based controls whose look comes from themed borders.
export function buttonProps(onActivate: () => void) {
    return {
        role: 'button',
        tabIndex: 0,
        onClick: onActivate,
        onKeyDown: (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onActivate();
            }
        },
    } as const;
}
