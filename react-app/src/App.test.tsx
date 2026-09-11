import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { SettingsProvider } from './context/SettingsContext';
import * as api from './services/hackerNewsApi';
import { AppShell } from './App';

vi.mock('./services/hackerNewsApi');

describe('AppShell', () => {
    it('redirects the root route to news', async () => {
        vi.mocked(api.fetchFeed).mockResolvedValue([]);
        render(<MemoryRouter initialEntries={['/']}><SettingsProvider><AppShell /></SettingsProvider></MemoryRouter>);
        await waitFor(() => expect(api.fetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal)));
    });
});
