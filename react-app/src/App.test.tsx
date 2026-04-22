import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { SettingsProvider } from './context/SettingsContext';
import type { Story } from './types/story';

const mockStories: Story[] = [
    {
        id: 1,
        title: 'Test story',
        points: 10,
        user: 'tester',
        time: 0,
        time_ago: '1 minute ago',
        type: 'story',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
    },
];

describe('App', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('theme', 'default');
        vi.stubGlobal(
            'fetch',
            vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    json: () => Promise.resolve(mockStories),
                } as Response),
            ),
        );
    });

    it('renders the header navigation on the home page', async () => {
        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/news/1']}>
                    <App />
                </MemoryRouter>
            </SettingsProvider>,
        );

        expect(screen.getByText('new')).toBeInTheDocument();
        expect(screen.getByText('show')).toBeInTheDocument();
        expect(screen.getByText('ask')).toBeInTheDocument();
        expect(screen.getByText('jobs')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Test story')).toBeInTheDocument();
        });
    });
});
