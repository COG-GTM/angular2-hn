import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

function makeComment(partial: Partial<Comment>): Comment {
  const comment = new Comment();
  Object.assign(comment, {
    id: 1,
    level: 0,
    user: 'pg',
    time: 0,
    time_ago: '1 hour ago',
    content: '<p>Hi</p>',
    deleted: false,
    comments: [],
  });
  Object.assign(comment, partial);
  return comment;
}

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });

  it('creates the component and defaults collapse to false on init', () => {
    component.comment = makeComment({});
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.collapse).toBe(false);
  });

  it('renders the comment author and content', () => {
    component.comment = makeComment({ user: 'dang', content: '<p>Welcome</p>' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('dang');
    expect(fixture.nativeElement.textContent).toContain('Welcome');
  });

  it('renders the deleted state for a deleted comment', () => {
    component.comment = makeComment({ deleted: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Comment Deleted');
  });
});
