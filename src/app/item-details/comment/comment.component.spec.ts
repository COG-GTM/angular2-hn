import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let component: CommentComponent;
  let el: HTMLElement;

  const comment: Comment = {
    id: 1,
    level: 0,
    user: 'alice',
    time: 0,
    time_ago: '2 hours ago',
    content: '<p>Top level</p>',
    deleted: false,
    comments: [
      { id: 2, level: 1, user: 'bob', time: 0, time_ago: '1 hour ago', content: 'reply', deleted: false, comments: [] },
    ],
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  it('renders the comment and its nested replies', () => {
    component.comment = comment;
    fixture.detectChanges();

    expect(component.collapse).toBe(false);
    expect(el.querySelector('.comment-text').textContent).toContain('Top level');
    expect(el.querySelectorAll('app-comment').length).toBe(1);
    expect(el.textContent).toContain('bob');
  });

  it('collapses and expands the comment tree', () => {
    component.comment = comment;
    fixture.detectChanges();

    const toggle = el.querySelector('.collapse') as HTMLElement;
    const tree = el.querySelector('.comment-tree > div') as HTMLElement;

    toggle.click();
    fixture.detectChanges();
    expect(component.collapse).toBe(true);
    expect(toggle.textContent).toContain('[+]');
    expect(tree.hidden).toBe(true);

    toggle.click();
    fixture.detectChanges();
    expect(component.collapse).toBe(false);
    expect(tree.hidden).toBe(false);
  });

  it('renders a placeholder for deleted comments', () => {
    component.comment = { ...comment, deleted: true };
    fixture.detectChanges();

    expect(el.querySelector('.comment-text')).toBeNull();
    expect(el.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
  });
});
