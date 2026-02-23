import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
    let component: CommentComponent;
    let fixture: ComponentFixture<CommentComponent>;

    const mockComment: Comment = {
        id: 1,
        level: 0,
        user: 'testuser',
        time: 1234567890,
        time_ago: '2 hours ago',
        content: '<p>This is a test comment</p>',
        deleted: false,
        comments: [],
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, CommonModule],
            declarations: [CommentComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommentComponent);
        component = fixture.componentInstance;
        component.comment = mockComment;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize collapse to false', () => {
        expect(component.collapse).toBe(false);
    });

    it('should accept a comment input', () => {
        expect(component.comment).toEqual(mockComment);
    });

    it('should display user name from comment', () => {
        expect(component.comment.user).toBe('testuser');
    });

    it('should show deleted message for deleted comments', () => {
        const deletedComment: Comment = {
            ...mockComment,
            deleted: true,
        };
        component.comment = deletedComment;
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.deleted-meta')).toBeTruthy();
    });
});
