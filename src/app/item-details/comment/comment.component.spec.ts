import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentComponent]
    });

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with collapse set to false', () => {
    component.ngOnInit();
    expect(component.collapse).toBe(false);
  });

  it('should accept comment as input', () => {
    const mockComment: Comment = {
      id: 1,
      level: 0,
      user: 'testuser',
      time: 1234567890,
      time_ago: '1 hour ago',
      content: 'Test comment',
      deleted: false,
      comments: []
    };
    component.comment = mockComment;
    expect(component.comment).toEqual(mockComment);
  });

  it('should handle nested comments', () => {
    const mockComment: Comment = {
      id: 1,
      level: 0,
      user: 'testuser',
      time: 1234567890,
      time_ago: '1 hour ago',
      content: 'Parent comment',
      deleted: false,
      comments: [
        {
          id: 2,
          level: 1,
          user: 'anotheruser',
          time: 1234567900,
          time_ago: '50 minutes ago',
          content: 'Child comment',
          deleted: false,
          comments: []
        }
      ]
    };
    component.comment = mockComment;
    expect(component.comment.comments.length).toBe(1);
    expect(component.comment.comments[0].level).toBe(1);
  });

  it('should handle deleted comments', () => {
    const mockComment: Comment = {
      id: 1,
      level: 0,
      user: '',
      time: 1234567890,
      time_ago: '1 hour ago',
      content: '[deleted]',
      deleted: true,
      comments: []
    };
    component.comment = mockComment;
    expect(component.comment.deleted).toBe(true);
  });

  it('should handle comments with HTML content', () => {
    const mockComment: Comment = {
      id: 1,
      level: 0,
      user: 'testuser',
      time: 1234567890,
      time_ago: '1 hour ago',
      content: '<p>Comment with <strong>HTML</strong></p>',
      deleted: false,
      comments: []
    };
    component.comment = mockComment;
    expect(component.comment.content).toContain('<p>');
    expect(component.comment.content).toContain('<strong>');
  });

  it('should handle deeply nested comments', () => {
    const mockComment: Comment = {
      id: 1,
      level: 0,
      user: 'testuser',
      time: 1234567890,
      time_ago: '1 hour ago',
      content: 'Level 0',
      deleted: false,
      comments: [
        {
          id: 2,
          level: 1,
          user: 'user2',
          time: 1234567890,
          time_ago: '1 hour ago',
          content: 'Level 1',
          deleted: false,
          comments: [
            {
              id: 3,
              level: 2,
              user: 'user3',
              time: 1234567890,
              time_ago: '1 hour ago',
              content: 'Level 2',
              deleted: false,
              comments: []
            }
          ]
        }
      ]
    };
    component.comment = mockComment;
    expect(component.comment.comments[0].comments.length).toBe(1);
    expect(component.comment.comments[0].comments[0].level).toBe(2);
  });

  it('should handle comment without user', () => {
    const mockComment: Comment = {
      id: 1,
      level: 0,
      user: '',
      time: 1234567890,
      time_ago: '1 hour ago',
      content: 'Anonymous comment',
      deleted: false,
      comments: []
    };
    component.comment = mockComment;
    expect(component.comment.user).toBe('');
  });
});
