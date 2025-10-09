import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentComponent } from './comment.component';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommentComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = {
      id: 1,
      user: 'testuser',
      time_ago: '1 hour ago',
      content: 'Test comment',
      comments: []
    } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with collapse set to false', () => {
    fixture.detectChanges();
    expect(component.collapse).toBe(false);
  });

  it('should accept comment input', () => {
    expect(component.comment).toBeDefined();
    expect(component.comment.id).toBe(1);
  });

  it('should handle comments with nested comments', () => {
    component.comment = {
      id: 1,
      user: 'testuser',
      time_ago: '1 hour ago',
      content: 'Parent comment',
      comments: [
        { id: 2, user: 'user2', time_ago: '30 min ago', content: 'Child comment', comments: [] }
      ]
    } as any;

    fixture.detectChanges();

    expect(component.comment.comments.length).toBe(1);
  });
});
