import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import User from '../pages/User';
import { SettingsProvider } from '../context/SettingsContext';

const mockUser = {
    id: 'testuser',
    crated_time: 1234567890,
    created: '10 years ago',
    karma: 5000,
    avg: 10,
    about: 'A test user',
};

beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: () => Promise.resolve(mockUser),
    } as Response);
});

describe('User', () => {
    it('renders loading state initially', () => {
        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/user/testuser']}>
                    <Routes>
                        <Route path="/user/:id" element={<User />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        );
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders user profile after loading', async () => {
        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/user/testuser']}>
                    <Routes>
                        <Route path="/user/:id" element={<User />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        );
        await waitFor(() => {
            expect(screen.getByText('5000 ★')).toBeInTheDocument();
        });
    });

    it('renders user about section', async () => {
        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/user/testuser']}>
                    <Routes>
                        <Route path="/user/:id" element={<User />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        );
        await waitFor(() => {
            expect(screen.getByText('A test user')).toBeInTheDocument();
        });
    });
});
