import type { KeyboardEvent } from 'react';

/** Props that make a clickable span keyboard-operable like a button (Enter/Space) without changing its styling. */
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
