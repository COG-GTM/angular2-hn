import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useFeed } from '../../shared/api';
import { apiUrls } from '../../shared/api';
import { ErrorMessage, Loader } from '../../shared/components';
import { mockFetch, renderWithProviders } from '../../shared/test-utils';
import { AppShell } from './AppShell';

function FeedProbe() {
    const { data, isPending, isError } = useFeed('news', 1);
    if (isPending) return <Loader />;
    if (isError) return <ErrorMessage message="Could not load HN stories." />;
    return (
        <ul data-testid="page">
            {data.map((story) => (
                <li key={story.id}>{story.title}</li>
            ))}
        </ul>
    );
}

function renderShell(route = '/news/1') {
    return renderWithProviders(
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/news/:page" element={<FeedProbe />} />
            </Route>
        </Routes>,
        { route }
    );
}

describe('AppShell', () => {
    it('renders .body-cover and .wrapper > header, outlet, footer (app.component parity)', async () => {
        mockFetch({ [apiUrls.feed('news', 1)]: [{ id: 1, title: 'Hello HN' }] });
        const { container } = renderShell();
        const bodyCover = container.querySelector('.body-cover');
        const wrapper = container.querySelector('.wrapper');
        expect(bodyCover).toBeInTheDocument();
        expect(bodyCover?.nextElementSibling).toBe(wrapper);

        const page = await screen.findByTestId('page');
        const [header, outlet, footer] = Array.from(wrapper!.children);
        expect(header.tagName).toBe('HEADER');
        expect(outlet).toBe(page);
        expect(footer).toHaveAttribute('id', 'footer');
        expect(screen.getByText('Hello HN')).toBeInTheDocument();
    });

    it('renders the loading state of the routed page inside the wrapper', () => {
        mockFetch({ [apiUrls.feed('news', 1)]: () => new Promise(() => {}) });
        const { container } = renderShell();
        const loader = screen.getByRole('status');
        expect(container.querySelector('.wrapper')).toContainElement(loader);
        expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('renders the error state of the routed page inside the wrapper', async () => {
        mockFetch({});
        const { container } = renderShell();
        const alert = await screen.findByRole('alert');
        expect(container.querySelector('.wrapper')).toContainElement(alert);
        expect(container.querySelector('#footer')).toBeInTheDocument();
    });

    it('puts the theme class on <html>, not on the shell', async () => {
        window.localStorage.setItem('theme', 'amoledblack');
        mockFetch({ [apiUrls.feed('news', 1)]: [] });
        const { container, user } = renderShell();
        expect(document.documentElement).toHaveClass('amoledblack');
        expect(container.querySelector('.amoledblack')).toBeNull();

        await user.click(screen.getByRole('button', { name: 'Settings' }));
        await user.click(screen.getByRole('radio', { name: 'Night' }));
        expect(document.documentElement).toHaveClass('night');
        expect(document.documentElement).not.toHaveClass('amoledblack');
    });
});

describe('Footer', () => {
    it('ports the Angular footer as-is', () => {
        mockFetch({ [apiUrls.feed('news', 1)]: [] });
        renderShell();
        const footer = document.getElementById('footer')!;
        expect(footer).toHaveTextContent('Show this project some ❤ on GitHub');
        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
    });
});
