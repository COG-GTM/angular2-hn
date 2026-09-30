import type { Story } from '../models';

export function hasExternalUrl(item: Story): boolean {
    return item.url.indexOf('http') === 0;
}
