import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type CustomElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'app-comment': CustomElement;
            'app-error-message': CustomElement;
            'app-feed': CustomElement;
            'app-footer': CustomElement;
            'app-header': CustomElement;
            'app-item-details': CustomElement;
            'app-loader': CustomElement;
            'app-settings': CustomElement;
            'app-user': CustomElement;
            item: CustomElement;
            'router-outlet': CustomElement;
        }
    }
}
