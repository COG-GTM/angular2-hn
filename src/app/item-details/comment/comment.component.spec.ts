import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;
  let element: HTMLElement;

  function comment(overrides: Partial<Comment> = {}): Comment {
    return {
      id: 1,
      level: 0,
      user: 'dang',
      time: 0,
      time_ago: '2 hours ago',
      content: '<p>Top level comment</p>',
      deleted: false,
      comments: [],
      ...overrides,
    };
  }

  function render(value: Comment) {
    component.comment = value;
    fixture.detectChanges();
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should create expanded', () => {
    render(comment());

    expect(component).toBeTruthy();
    expect(component.collapse).toBe(false);
  });

  it('should render the author, time and HTML content', () => {
    render(comment());

    const author = element.querySelector('.meta a');
    expect(author.textContent).toBe('dang');
    expect(author.getAttribute('href')).toBe('/user/dang');
    expect(element.querySelector('.time').textContent).toBe('2 hours ago');
    expect(element.querySelector('.comment-text p').textContent).toBe('Top level comment');
  });

  it('should recursively render nested replies', () => {
    const reply = comment({ id: 2, user: 'pg', content: 'Reply', comments: [comment({ id: 3, user: 'tptacek', content: 'Nested' })] });
    render(comment({ comments: [reply] }));

    expect(element.querySelectorAll('app-comment').length).toBe(2);
    expect(Array.from(element.querySelectorAll('.meta a')).map(a => a.textContent)).toEqual(['dang', 'pg', 'tptacek']);
  });

  it('should collapse and expand the comment tree', () => {
    render(comment());
    const toggle: HTMLElement = element.querySelector('.collapse');
    const tree: HTMLElement = element.querySelector('.comment-tree > div');

    expect(toggle.textContent).toBe('[-]');
    expect(tree.hidden).toBe(false);

    toggle.click();
    fixture.detectChanges();

    expect(component.collapse).toBe(true);
    expect(toggle.textContent).toBe('[+]');
    expect(tree.hidden).toBe(true);
    expect(element.querySelector('.meta').classList).toContain('meta-collapse');

    toggle.click();
    fixture.detectChanges();

    expect(tree.hidden).toBe(false);
  });

  it('should render a placeholder for deleted comments', () => {
    render(comment({ deleted: true }));

    expect(element.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
    expect(element.querySelector('.meta')).toBeNull();
  });
});
