import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeComment } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { Comment } from './Comment';

describe('Comment', () => {
    it('renders the author, timestamp and html content', () => {
        renderWithProviders(<Comment comment={makeComment()} />);

        expect(screen.getByRole('link', { name: 'bob' })).toHaveAttribute('href', '/user/bob');
        expect(screen.getByText('1 hour ago')).toBeInTheDocument();
        expect(screen.getByText('Nice write-up')).toBeInTheDocument();
    });

    it('renders nested replies recursively', () => {
        const comment = makeComment({
            comments: [makeComment({ id: 11, user: 'carol', content: '<p>A reply</p>' })],
        });

        renderWithProviders(<Comment comment={comment} />);

        expect(screen.getByText('A reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'carol' })).toBeInTheDocument();
    });

    it('collapses and expands the comment body', async () => {
        renderWithProviders(<Comment comment={makeComment()} />);

        const toggle = screen.getByText('[-]');
        expect(screen.getByText('Nice write-up')).toBeVisible();

        await userEvent.click(toggle);
        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(screen.getByText('Nice write-up')).not.toBeVisible();

        await userEvent.click(screen.getByText('[+]'));
        expect(screen.getByText('[-]')).toBeInTheDocument();
        expect(screen.getByText('Nice write-up')).toBeVisible();
    });

    it('renders a placeholder for deleted comments', () => {
        renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'bob' })).not.toBeInTheDocument();
    });
});
