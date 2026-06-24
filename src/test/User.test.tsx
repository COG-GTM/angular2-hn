import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import User from '../components/User';
import * as api from '../api/hackerNews';

vi.mock('../api/hackerNews');

const mockUser = {
    id: 'testuser',
    crated_time: 123,
    created: '2020-01-01',
    karma: 500,
    avg: 10,
    about: '<p>Hello from testuser</p>',
};

beforeEach(() => {
    vi.mocked(api.fetchUser).mockResolvedValue(mockUser);
});

function renderUser(path = '/user/testuser') {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/user/:id" element={<User />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('User', () => {
    it('shows loader then renders user profile', async () => {
        renderUser();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('testuser')).toBeInTheDocument();
        });
    });

    it('renders karma', async () => {
        renderUser();
        await waitFor(() => {
            expect(screen.getByText('500')).toBeInTheDocument();
        });
    });

    it('renders created date', async () => {
        renderUser();
        await waitFor(() => {
            expect(screen.getByText('2020-01-01')).toBeInTheDocument();
        });
    });

    it('renders about with HTML', async () => {
        renderUser();
        await waitFor(() => {
            expect(screen.getByText('Hello from testuser')).toBeInTheDocument();
        });
    });

    it('shows error on fetch failure', async () => {
        vi.mocked(api.fetchUser).mockRejectedValueOnce(new Error('fail'));
        renderUser();
        await waitFor(() => {
            expect(screen.getByText(/Could not load user/)).toBeInTheDocument();
        });
    });

    it('renders back button', async () => {
        renderUser();
        await waitFor(() => {
            expect(screen.getByText('‹')).toBeInTheDocument();
        });
    });
});
