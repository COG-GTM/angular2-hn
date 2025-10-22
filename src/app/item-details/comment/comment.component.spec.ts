import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommentComponent } from './comment.component';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept comment input', () => {
    const testComment = {
      id: 1,
      level: 0,
      user: 'test',
      time: 1234567890,
      time_ago: '1 hour ago',
      content: 'test comment',
      deleted: false,
      comments: []
    };
    component.comment = testComment;
    expect(component.comment).toEqual(testComment);
  });
});
