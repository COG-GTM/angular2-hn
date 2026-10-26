import type { AnchorHTMLAttributes } from 'react';

export function linkTargetProps(openLinkInNewTab: boolean): AnchorHTMLAttributes<HTMLAnchorElement> {
    return openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
}

export function hasUrl(url: string | undefined): boolean {
    return url?.indexOf('http') === 0;
}
