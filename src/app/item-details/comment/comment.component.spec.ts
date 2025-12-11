import { ComponentFixture, TestBed } from '@angular/core/testing';
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
        content: 'This is a test comment',
        deleted: false,
        comments: [],
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommentComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CommentComponent);
        component = fixture.componentInstance;
        component.comment = mockComment;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should accept comment input', () => {
        expect(component.comment).toBe(mockComment);
    });

    describe('ngOnInit', () => {
        it('should set collapse to false on init', () => {
            component.ngOnInit();
            expect(component.collapse).toBe(false);
        });
    });

    describe('collapse property', () => {
        it('should be false by default after ngOnInit', () => {
            expect(component.collapse).toBe(false);
        });

        it('should be toggleable', () => {
            component.collapse = true;
            expect(component.collapse).toBe(true);
            component.collapse = false;
            expect(component.collapse).toBe(false);
        });
    });

    describe('comment with nested comments', () => {
        it('should handle comments with nested comments', () => {
            const nestedComment: Comment = {
                id: 2,
                level: 1,
                user: 'nesteduser',
                time: 1234567891,
                time_ago: '1 hour ago',
                content: 'This is a nested comment',
                deleted: false,
                comments: [],
            };

            const commentWithNested: Comment = {
                ...mockComment,
                comments: [nestedComment],
            };

            component.comment = commentWithNested;
            fixture.detectChanges();

            expect(component.comment.comments.length).toBe(1);
            expect(component.comment.comments[0]).toBe(nestedComment);
        });
    });

    describe('deleted comments', () => {
        it('should handle deleted comments', () => {
            const deletedComment: Comment = {
                ...mockComment,
                deleted: true,
            };

            component.comment = deletedComment;
            fixture.detectChanges();

            expect(component.comment.deleted).toBe(true);
        });
    });
});
