import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = {
      id: 1,
      user: 'alice',
      time_ago: '1 hour ago',
      content: 'hello',
      comments: [],
      deleted: false
    } as Comment;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set collapse to false on init', () => {
    fixture.detectChanges();
    expect(component.collapse).toBe(false);
  });
});
