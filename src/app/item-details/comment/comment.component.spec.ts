import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

function createMockComment(overrides: Partial<Comment> = {}): Comment {
    const comment = new Comment();
    comment.id = 1;
    comment.level = 0;
    comment.user = 'testuser';
    comment.time = 1234567890;
    comment.time_ago = '2 hours ago';
    comment.content = '<p>This is a test comment</p>';
    comment.deleted = false;
    comment.comments = [];
    Object.assign(comment, overrides);
    return comment;
}

describe('CommentComponent', () => {
    let component: CommentComponent;
    let fixture: ComponentFixture<CommentComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [CommentComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CommentComponent);
        component = fixture.componentInstance;
        component.comment = createMockComment();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set collapse to false on init', () => {
        expect(component.collapse).toBe(false);
    });

    it('should render comment content', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.comment-text').innerHTML).toContain('This is a test comment');
    });

    it('should render user name', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.textContent).toContain('testuser');
    });

    it('should render time ago', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.time').textContent).toContain('2 hours ago');
    });

    it('should render collapse toggle', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.collapse')).toBeTruthy();
    });

    it('should show [-] when not collapsed', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.collapse').textContent).toContain('-');
    });

    it('should toggle collapse state', () => {
        component.collapse = true;
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.collapse').textContent).toContain('+');
    });

    it('should hide comment tree when collapsed', () => {
        component.collapse = true;
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        const hiddenDiv = compiled.querySelector('.comment-tree div[hidden]');
        expect(hiddenDiv).toBeTruthy();
    });

    it('should show comment tree when not collapsed', () => {
        component.collapse = false;
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        const visibleDiv = compiled.querySelector('.comment-tree div:not([hidden])');
        expect(visibleDiv).toBeTruthy();
    });

    it('should show deleted message for deleted comments', () => {
        component.comment = createMockComment({ deleted: true });
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.deleted-meta')).toBeTruthy();
        expect(compiled.textContent).toContain('Comment Deleted');
    });

    it('should not show meta for deleted comments', () => {
        component.comment = createMockComment({ deleted: true });
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.meta')).toBeFalsy();
    });

    it('should render nested comments', () => {
        const nestedComment = createMockComment({
            id: 2,
            user: 'nested_user',
            content: '<p>Nested comment</p>'
        });
        component.comment = createMockComment({ comments: [nestedComment] });
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        const subtree = compiled.querySelector('.subtree');
        expect(subtree).toBeTruthy();
    });
});
