import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type CustomElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

/**
 * The Angular app rendered each component inside a host element (e.g. <app-header>).
 * Keeping those host elements in the DOM keeps the markup and styling identical.
 */
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'app-header': CustomElement;
            'app-footer': CustomElement;
            'app-settings': CustomElement;
            'app-feed': CustomElement;
            item: CustomElement;
            'app-item-details': CustomElement;
            'app-comment': CustomElement;
            'app-user': CustomElement;
            'app-loader': CustomElement;
            'app-error-message': CustomElement;
            'router-outlet': CustomElement;
        }
    }
}
