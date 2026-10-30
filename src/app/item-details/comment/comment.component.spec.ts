import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Comment } from '../../shared/models/comment';
import { CommentComponent } from './comment.component';

describe('CommentComponent', () => {
  const comment = {
    id: 1,
    user: 'pg',
    time_ago: '2 hours ago',
    content: '<p>Parent</p>',
    deleted: false,
    comments: [{ id: 2, user: 'dang', time_ago: '1 hour ago', content: '<p>Child</p>', deleted: false, comments: [] }],
  } as unknown as Comment;

  it('renders nested comments and toggles collapse', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(CommentComponent);
    fixture.componentRef.setInput('comment', comment);
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('app-comment').length).toBe(1);
    expect(el.textContent).toContain('Child');

    const toggle = el.querySelector<HTMLElement>('.collapse')!;
    expect(toggle.textContent).toBe('[-]');
    toggle.click();
    await fixture.whenStable();

    expect(toggle.textContent).toBe('[+]');
    expect(el.querySelector<HTMLElement>('.comment-tree > div')!.hidden).toBe(true);
  });

  it('renders deleted comments as a placeholder', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(CommentComponent);
    fixture.componentRef.setInput('comment', { ...comment, deleted: true });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Comment Deleted');
  });
});
