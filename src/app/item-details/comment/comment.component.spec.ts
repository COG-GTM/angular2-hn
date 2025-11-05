import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept comment input', () => {
    const testComment: Comment = {
      id: 1,
      level: 0,
      user: 'testuser',
      time: 123456,
      time_ago: '1 hour ago',
      content: 'Test comment',
      deleted: false,
      comments: []
    };
    component.comment = testComment;
    expect(component.comment).toEqual(testComment);
  });

  it('should initialize collapse to false on ngOnInit', () => {
    component.ngOnInit();
    expect(component.collapse).toBe(false);
  });

  it('should allow collapse to be toggled', () => {
    component.ngOnInit();
    expect(component.collapse).toBe(false);
    component.collapse = true;
    expect(component.collapse).toBe(true);
  });
});
