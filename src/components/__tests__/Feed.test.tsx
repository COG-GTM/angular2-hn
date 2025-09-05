import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Feed from '../Feed';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </QueryClientProvider>
    );
};

describe('Feed Component', () => {
    it('renders loading state initially', () => {
        render(
            <TestWrapper>
                <Feed feedType="news" />
            </TestWrapper>
        );
        
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders feed title correctly', async () => {
        render(
            <TestWrapper>
                <Feed feedType="news" />
            </TestWrapper>
        );
        
        expect(screen.getByText('News')).toBeInTheDocument();
    });
});
