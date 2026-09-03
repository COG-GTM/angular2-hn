import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SettingsProvider } from '../context/SettingsContext';
import type { Comment, Story, User } from '../types';

export function renderWithProviders(ui: ReactElement, { route = '/', path }: { route?: string; path?: string } = {}) {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <SettingsProvider>
                {path ? (
                    <Routes>
                        <Route path={path} element={ui} />
                    </Routes>
                ) : (
                    ui
                )}
            </SettingsProvider>
        </MemoryRouter>
    );
}

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 42,
        user: 'alice',
        time: 1600000000,
        time_ago: '2 hours ago',
        type: 'link',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        ...overrides,
    };
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 10,
        level: 0,
        user: 'bob',
        time: 1600000000,
        time_ago: '1 hour ago',
        content: '<p>Nice post</p>',
        comments: [],
        ...overrides,
    };
}

export function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 'alice',
        created_time: 1500000000,
        created: 'June 1, 2017',
        karma: 1234,
        ...overrides,
    };
}
