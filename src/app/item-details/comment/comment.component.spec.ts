import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

const nested: Comment = {
  id: 1,
  level: 0,
  user: 'bob',
  time: 1,
  time_ago: '1 hour ago',
  content: '<p>Parent comment</p>',
  deleted: false,
  comments: [
    {
      id: 2,
      level: 1,
      user: 'carol',
      time: 2,
      time_ago: '30 minutes ago',
      content: '<p>Child comment</p>',
      deleted: false,
      comments: [],
    },
  ],
} as Comment;

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let component: CommentComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });

  it('renders the user, time and nested subcomment', () => {
    component.comment = nested;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('bob');
    expect(el.textContent).toContain('1 hour ago');
    expect(el.textContent).toContain('Parent comment');
    expect(el.textContent).toContain('Child comment');
  });

  it('toggles collapse when the control is clicked', () => {
    component.comment = nested;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const toggle = el.querySelector('.collapse') as HTMLElement;
    expect(toggle.textContent).toContain('[-]');
    toggle.click();
    fixture.detectChanges();
    expect((el.querySelector('.collapse') as HTMLElement).textContent).toContain('[+]');
  });

  it('renders a deleted placeholder for deleted comments', () => {
    component.comment = { ...nested, deleted: true } as Comment;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.deleted-meta')).toBeTruthy();
    expect(el.textContent).toContain('[deleted]');
    expect(el.textContent).toContain('Comment Deleted');
  });
});
