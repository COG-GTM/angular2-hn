import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type CustomElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

/*
  The Angular app's component selectors (app-header, item, ...) are part of the rendered
  DOM and are targeted by the ported stylesheets, so they are kept as wrapper elements.
*/
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'app-header': CustomElement;
            'app-footer': CustomElement;
            'app-settings': CustomElement;
            'app-loader': CustomElement;
            'app-error-message': CustomElement;
            'app-feed': CustomElement;
            'app-item-details': CustomElement;
            'app-comment': CustomElement;
            'app-user': CustomElement;
            item: CustomElement;
        }
    }
}
