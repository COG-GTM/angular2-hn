import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it } from 'vitest';

import { Story } from '../../shared/models/story';

const store: Record<string, string> = {};

beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
        value: {
            getItem: (key: string) => (key in store ? store[key] : null),
            setItem: (key: string, value: string) => {
                store[key] = value;
            },
            removeItem: (key: string) => {
                delete store[key];
            },
            clear: () => {
                Object.keys(store).forEach(key => delete store[key]);
            },
        },
        configurable: true,
    });
});

const story: Story = {
    id: 1,
    title: 'A story',
    url: 'https://example.com/story',
    domain: 'example.com',
    user: 'someone',
    points: 10,
    comments_count: 2,
    time_ago: '1 hour ago',
    type: 'link',
    time: 0,
    content: '',
    text: '',
    comments: [],
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
};

async function renderItem() {
    const { default: Item } = await import('./item.component');
    const { SettingsProvider } = await import('../../shared/services/settings-context');
    return renderToStaticMarkup(
        <MemoryRouter>
            <SettingsProvider>
                <Item item={story} />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Item external link target', () => {
    it('keeps external links in the same tab by default', async () => {
        store.openLinkInNewTab = 'false';
        const markup = await renderItem();
        expect(markup).not.toContain('target="_blank"');
    });

    it('opens external links in a new tab when the setting is on', async () => {
        store.openLinkInNewTab = 'true';
        const markup = await renderItem();
        expect(markup).toContain('target="_blank"');
        expect(markup).toContain('rel="noopener noreferrer"');
    });
});
