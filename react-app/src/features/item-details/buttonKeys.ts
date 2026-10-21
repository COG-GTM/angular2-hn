import type { KeyboardEvent } from 'react';

/** Enter/Space activation for clickable non-button elements that keep their Angular markup (`role="button"`). */
export function onButtonKeyDown(action: () => void) {
    return (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            action();
        }
    };
}
