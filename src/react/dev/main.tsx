import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { Item } from '../components/Item';
import { SettingsProvider } from '../context/SettingsContext';
import { Story } from '../../app/shared/models/story';

const story = (overrides: Partial<Story>): Story => ({
    id: 1,
    title: 'Story title',
    points: 42,
    user: 'pg',
    time: 0,
    time_ago: ('2 hours ago' as unknown) as number,
    type: 'story',
    url: 'https://example.com/a-story',
    domain: 'example.com',
    comments: [],
    comments_count: 12,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
});

const stories: Story[] = [
    story({ id: 101, title: 'A story with an external link' }),
    story({ id: 102, title: 'An Ask HN story with no external link', url: 'item?id=102', domain: '' }),
    story({ id: 103, title: 'A single comment story', comments_count: 1 }),
    story({ id: 104, title: 'A story nobody commented on', comments_count: 0 }),
    story({ id: 105, title: 'Hiring: a job post', type: 'job', user: '', points: 0, comments_count: 0 }),
];

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <BrowserRouter>
        <SettingsProvider>
            <ol className="list-margin">
                {stories.map((item) => (
                    <li key={item.id} className="post">
                        <Item item={item} />
                    </li>
                ))}
            </ol>
        </SettingsProvider>
    </BrowserRouter>
);
