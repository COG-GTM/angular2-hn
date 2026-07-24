// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import type { Comment as CommentModel } from '../models';
import Comment from './Comment';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        content: '<p>hello world</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

function renderComment(comment: CommentModel) {
    return render(
        <MemoryRouter>
            <Comment comment={comment} />
        </MemoryRouter>
    );
}

describe('Comment', () => {
    function getToggle(container: HTMLElement): HTMLElement {
        const toggle = container.querySelector('.meta .collapse');
        expect(toggle).not.toBeNull();
        return toggle as HTMLElement;
    }

    it('renders user link, time and content', () => {
        const { container } = renderComment(makeComment());
        const userLink = screen.getByRole('link', { name: 'pg' });
        expect(userLink.getAttribute('href')).toBe('/user/pg');
        expect(screen.getByText('2 hours ago')).toBeTruthy();
        expect(screen.getByText('hello world')).toBeTruthy();
        expect(getToggle(container).textContent).toBe('[-]');
    });

    it('renders deleted block for deleted comments', () => {
        const { container } = renderComment(makeComment({ deleted: true }));
        expect(container.querySelector('.deleted-meta .collapse')?.textContent).toBe('[deleted]');
        expect(container.querySelector('a')).toBeNull();
    });

    it('collapses and expands the comment subtree on toggle', () => {
        const { container } = renderComment(makeComment());
        const toggle = getToggle(container);
        fireEvent.click(toggle);
        expect(toggle.textContent).toBe('[+]');
        const hiddenDiv = container.querySelector('.comment-tree > div');
        expect(hiddenDiv?.hasAttribute('hidden')).toBe(true);
        fireEvent.click(toggle);
        expect(hiddenDiv?.hasAttribute('hidden')).toBe(false);
    });

    it('renders nested comments recursively', () => {
        renderComment(
            makeComment({
                comments: [
                    makeComment({ id: 2, user: 'child', content: '<p>nested</p>' }),
                ],
            })
        );
        expect(screen.getByText('nested')).toBeTruthy();
        expect(screen.getByRole('link', { name: 'child' })).toBeTruthy();
    });
});
