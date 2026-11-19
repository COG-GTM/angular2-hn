import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Comment } from '../../shared/models/comment';
import { CommentComponent } from './comment.component';

const comment = (overrides: Partial<Comment> = {}): Comment => ({
    id: 1,
    level: 0,
    user: 'alice',
    time: 0,
    time_ago: '1 hour ago',
    content: '<p>Parent</p>',
    comments: [
        { id: 2, level: 1, user: 'bob', time: 0, time_ago: '30 minutes ago', content: '<p>Child</p>', comments: [] },
    ],
    ...overrides,
});

describe('CommentComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommentComponent],
            providers: [provideRouter([])],
        }).compileComponents();
    });

    function render(value: Comment) {
        const fixture = TestBed.createComponent(CommentComponent);
        fixture.componentRef.setInput('comment', value);
        fixture.detectChanges();
        return { fixture, el: fixture.nativeElement as HTMLElement };
    }

    it('renders the author, time, text and nested replies', () => {
        const { el } = render(comment());
        const meta = el.querySelector('.meta')!;
        expect(meta.querySelector('.collapse')!.textContent).toBe('[-]');
        expect(meta.querySelector('a')!.getAttribute('href')).toBe('/user/alice');
        expect(meta.querySelector('.time')!.textContent).toBe('1 hour ago');
        expect(el.querySelector('.comment-text')!.innerHTML).toBe('<p>Parent</p>');
        const child = el.querySelector('.subtree > li app-comment')!;
        expect(child.querySelector('.meta a')!.textContent).toBe('bob');
        expect(child.querySelector('.comment-text')!.innerHTML).toBe('<p>Child</p>');
    });

    it('collapses and expands the subtree', () => {
        const { fixture, el } = render(comment());
        const toggle = el.querySelector<HTMLElement>('.meta .collapse')!;
        const body = el.querySelector<HTMLElement>('.comment-tree > div')!;
        expect(body.hidden).toBe(false);

        toggle.click();
        fixture.detectChanges();
        expect(toggle.textContent).toBe('[+]');
        expect(body.hidden).toBe(true);
        expect(el.querySelector('.meta')!.classList).toContain('meta-collapse');

        toggle.click();
        fixture.detectChanges();
        expect(toggle.textContent).toBe('[-]');
        expect(body.hidden).toBe(false);
        expect(el.querySelector('.meta')!.classList).not.toContain('meta-collapse');
    });

    it('collapses a nested reply independently of its parent', () => {
        const { fixture, el } = render(comment());
        const child = el.querySelector('.subtree app-comment')!;
        child.querySelector<HTMLElement>('.meta .collapse')!.click();
        fixture.detectChanges();
        expect(child.querySelector<HTMLElement>('.comment-tree > div')!.hidden).toBe(true);
        expect(el.querySelector<HTMLElement>('.comment-tree > div')!.hidden).toBe(false);
    });

    it('shows a placeholder for deleted comments', () => {
        const { el } = render(comment({ deleted: true }));
        expect(el.querySelector('.meta')).toBeNull();
        expect(el.querySelector('.deleted-meta')!.textContent!.trim()).toBe('[deleted] | Comment Deleted');
    });
});
