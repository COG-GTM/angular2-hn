import type { Story } from '../types';

export function hasUrl(story: Story): boolean {
    return typeof story.url === 'string' && story.url.indexOf('http') === 0;
}
