import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import ItemDetailsPage from './ItemDetailsPage';
import { useItem } from '../hooks';
import { useSettings } from '../context/SettingsContext';
import { Story } from '../models';

vi.mock('../hooks', () => ({ useItem: vi.fn() }));
vi.mock('../context/SettingsContext', () => ({ useSettings: vi.fn() }));

const mockedUseItem = vi.mocked(useItem);
const mockedUseSettings = vi.mocked(useSettings);

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 123,
        title: 'Example Story',
        points: 42,
        user: 'alice',
        time: 0,
        time_ago: 0,
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 2,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function setSettings(openLinkInNewTab = false) {
    mockedUseSettings.mockReturnValue({
        settings: {
            showSettings: false,
            openLinkInNewTab,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        },
        toggleSettings: vi.fn(),
        toggleOpenLinksInNewTab: vi.fn(),
        setTheme: vi.fn(),
        setFont: vi.fn(),
        setSpacing: vi.fn(),
    });
}

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/item/123']}>
            <Routes>
                <Route path="/item/:id" element={<ItemDetailsPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('ItemDetailsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
        setSettings();
    });

    it('shows the loader while loading and no error', () => {
        mockedUseItem.mockReturnValue({ item: null, loading: true, error: null });
        const { container } = renderPage();

        expect(container.querySelector('.loading-section')).toBeInTheDocument();
        expect(container.querySelector('.error-section')).toBeNull();
        expect(container.querySelector('.item')).toBeNull();
    });

    it('shows the error message on error', () => {
        mockedUseItem.mockReturnValue({
            item: null,
            loading: false,
            error: new Error('boom'),
        });
        const { container } = renderPage();

        expect(container.querySelector('.error-section')).toBeInTheDocument();
        expect(screen.getByText('Could not load item comments.')).toBeInTheDocument();
        expect(container.querySelector('.loading-section')).toBeNull();
    });

    it('renders a populated story with header, subtext and recursive comments', () => {
        const item = makeStory({
            comments: [
                {
                    id: 1,
                    level: 0,
                    user: 'bob',
                    time: 0,
                    time_ago: '2 hours ago',
                    content: '<p>top-level</p>',
                    deleted: false,
                    comments: [
                        {
                            id: 2,
                            level: 1,
                            user: 'carol',
                            time: 0,
                            time_ago: '1 hour ago',
                            content: '<p>nested</p>',
                            deleted: false,
                            comments: [],
                        },
                    ],
                },
            ],
        });
        // Reproduce the runtime `content` body the frozen Story type omits.
        (item as Story & { content?: string }).content = '<p>the body</p>';
        mockedUseItem.mockReturnValue({ item, loading: false, error: null });
        setSettings(true);

        const { container } = renderPage();

        // External title link opens in a new tab (openLinkInNewTab = true).
        const titleLinks = screen.getAllByRole('link', { name: 'Example Story' });
        expect(titleLinks[0]).toHaveAttribute('href', 'https://example.com/post');
        expect(titleLinks[0]).toHaveAttribute('target', '_blank');
        expect(titleLinks[0]).toHaveAttribute('rel', 'noopener');

        expect(screen.getByText('example.com', { exact: false })).toBeInTheDocument();
        expect(screen.getByText(/42 points by/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
        expect(screen.getByRole('link', { name: '2 comments' })).toHaveAttribute(
            'href',
            '/item/123'
        );

        // Body content + recursive comments.
        expect(container.querySelector('.subject')?.innerHTML).toBe('<p>the body</p>');
        expect(screen.getByRole('link', { name: 'bob' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'carol' })).toBeInTheDocument();
        expect(container.innerHTML).toContain('nested');
    });

    it('renders poll options with correct bar widths', () => {
        const item = makeStory({
            type: 'poll',
            poll_votes_count: 100,
            poll: [
                { content: '<p>Option A</p>', points: 30 },
                { content: '<p>Option B</p>', points: 70 },
            ],
        });
        mockedUseItem.mockReturnValue({ item, loading: false, error: null });

        const { container } = renderPage();

        const bars = container.querySelectorAll<HTMLDivElement>('.pollBar');
        expect(bars).toHaveLength(2);
        expect(bars[0].style.width).toBe('30%');
        expect(bars[1].style.width).toBe('70%');
        expect(screen.getByText('30 points')).toBeInTheDocument();
        expect(screen.getByText('70 points')).toBeInTheDocument();
    });
});
