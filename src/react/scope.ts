export type ScopeAttributes = Record<string, string>;

/**
 * Emulates Angular's style encapsulation: `content(name)` marks the elements a
 * component renders in its own template, `host(name)` marks the element a parent
 * renders for a child component. The `componentScope` PostCSS plugin in
 * vite.config.ts rewrites `<name>.component.scss` selectors to match them.
 */
export function content(name: string): ScopeAttributes {
    return { [`data-c-${name}`]: '' };
}

export function host(name: string): ScopeAttributes {
    return { [`data-h-${name}`]: '' };
}
