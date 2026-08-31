import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Comment from './Comment';

const comment = { id: 1, level: 0, user: 'alice', time: 1, time_ago: '1 hour ago', content: '<b>Hello</b>', deleted: false, comments: [] };

describe('Comment', () => {
    it('collapses and expands comment text', () => {
        render(<MemoryRouter><Comment comment={comment} /></MemoryRouter>);
        expect(screen.getByText('Hello')).toBeVisible();
        fireEvent.click(screen.getByRole('button', { name: '[-]' }));
        expect(screen.getByText('Hello')).not.toBeVisible();
    });
    it('renders deleted comments', () => {
        render(<MemoryRouter><Comment comment={{ ...comment, deleted: true }} /></MemoryRouter>);
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
    });
});
