import type { KeyboardEvent } from 'react';

/** Keyboard activation (Enter / Space) for the non-button click targets kept from the Angular markup. */
export function onActivationKey(action: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };
}
