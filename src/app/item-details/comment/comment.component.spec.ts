import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 1,
    level: 0,
    user: 'alice',
    time: 0,
    time_ago: '2 hours ago',
    content: '<p>Top level</p>',
    deleted: false,
    comments: [],
    ...overrides,
  };
}

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let component: CommentComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent],
    });
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });

  function render(comment: Comment): HTMLElement {
    component.comment = comment;
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('starts expanded', () => {
    render(makeComment());
    expect(component.collapse).toBe(false);
  });

  it('renders the author link, age and HTML content', () => {
    const el = render(makeComment());
    const author = el.querySelector('.meta a');
    expect(author.textContent).toBe('alice');
    expect(author.getAttribute('href')).toBe('/user/alice');
    expect(el.querySelector('.time').textContent).toBe('2 hours ago');
    expect(el.querySelector('.comment-text p').textContent).toBe('Top level');
  });

  it('renders nested replies recursively', () => {
    const el = render(
      makeComment({
        comments: [
          makeComment({ id: 2, user: 'bob', content: 'Reply 1', comments: [makeComment({ id: 3, user: 'carol', content: 'Reply 1.1' })] }),
          makeComment({ id: 4, user: 'dave', content: 'Reply 2' }),
        ],
      })
    );

    const all = fixture.debugElement.queryAll(By.directive(CommentComponent));
    expect(all.length).toBe(3);
    expect(all.map(c => c.componentInstance.comment.user)).toEqual(['bob', 'carol', 'dave']);
    expect(el.querySelectorAll('.subtree').length).toBe(4);
    expect(el.textContent).toContain('Reply 1.1');
  });

  it('collapses and expands the thread when the toggle is clicked', () => {
    const el = render(makeComment({ comments: [makeComment({ id: 2, content: 'Child' })] }));
    const toggle = el.querySelector('.meta .collapse') as HTMLElement;
    const tree = el.querySelector('.comment-tree > div') as HTMLElement;

    expect(toggle.textContent).toBe('[-]');
    expect(tree.hidden).toBe(false);

    toggle.click();
    fixture.detectChanges();
    expect(component.collapse).toBe(true);
    expect(toggle.textContent).toBe('[+]');
    expect(tree.hidden).toBe(true);
    expect(el.querySelector('.meta').classList).toContain('meta-collapse');

    toggle.click();
    fixture.detectChanges();
    expect(tree.hidden).toBe(false);
  });

  it('renders a placeholder for deleted comments', () => {
    const el = render(makeComment({ deleted: true }));
    expect(el.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
    expect(el.querySelector('.meta')).toBeNull();
    expect(el.querySelector('.comment-text')).toBeNull();
  });
});
