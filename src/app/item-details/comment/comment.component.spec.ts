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
});
