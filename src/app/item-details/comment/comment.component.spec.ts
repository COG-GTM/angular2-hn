import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
    let component: CommentComponent;
    let fixture: ComponentFixture<CommentComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [CommentComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CommentComponent);
        component = fixture.componentInstance;
        component.comment = {
            id: 1,
            level: 0,
            user: 'testuser',
            time: 1234567890,
            time_ago: '2 hours ago',
            content: '<p>Test comment</p>',
            deleted: false,
            comments: [],
        } as Comment;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize collapse to false', () => {
        expect(component.collapse).toBe(false);
    });

    it('should accept comment as input', () => {
        expect(component.comment).toBeDefined();
        expect(component.comment.user).toBe('testuser');
        expect(component.comment.content).toBe('<p>Test comment</p>');
    });

    it('should have collapse property that can be toggled', () => {
        expect(component.collapse).toBe(false);
        component.collapse = true;
        expect(component.collapse).toBe(true);
    });

    it('should handle deleted comments', () => {
        component.comment.deleted = true;
        fixture.detectChanges();
        expect(component.comment.deleted).toBe(true);
    });

    it('should handle comments with nested sub-comments', () => {
        const subComment: Comment = {
            id: 2,
            level: 1,
            user: 'anotheruser',
            time: 1234567891,
            time_ago: '1 hour ago',
            content: '<p>Reply</p>',
            deleted: false,
            comments: [],
        };
        component.comment.comments = [subComment];
        fixture.detectChanges();
        expect(component.comment.comments.length).toBe(1);
    });
});
