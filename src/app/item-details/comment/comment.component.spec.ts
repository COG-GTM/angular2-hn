import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

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
    } as Comment;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
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

    it('should initialize collapse to false', () => {
        expect(component.collapse).toBe(false);
    });

    it('should render the user link', () => {
        const compiled = fixture.nativeElement;
        const userLink = compiled.querySelector('.meta a');
        expect(userLink).toBeTruthy();
        expect(userLink.textContent).toContain('testuser');
    });

    it('should render the time ago', () => {
        const compiled = fixture.nativeElement;
        const time = compiled.querySelector('.time');
        expect(time.textContent).toContain('2 hours ago');
    });

    it('should render the comment content', () => {
        const compiled = fixture.nativeElement;
        const content = compiled.querySelector('.comment-text');
        expect(content).toBeTruthy();
    });

    it('should render collapse button with minus sign initially', () => {
        const compiled = fixture.nativeElement;
        const collapseBtn = compiled.querySelector('.collapse');
        expect(collapseBtn.textContent).toContain('[-]');
    });

    it('should toggle collapse when clicking collapse button', () => {
        const compiled = fixture.nativeElement;
        const collapseBtn = compiled.querySelector('.collapse');
        collapseBtn.click();
        fixture.detectChanges();
        expect(component.collapse).toBe(true);
        expect(collapseBtn.textContent).toContain('[+]');
    });

    it('should hide comment content when collapsed', () => {
        component.collapse = true;
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const hiddenDiv = compiled.querySelector('.comment-tree div[hidden]');
        expect(hiddenDiv).toBeTruthy();
    });

    it('should show comment content when not collapsed', () => {
        component.collapse = false;
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const hiddenDiv = compiled.querySelector('.comment-tree div[hidden]');
        expect(hiddenDiv).toBeFalsy();
    });
});

describe('CommentComponent with deleted comment', () => {
    let component: CommentComponent;
    let fixture: ComponentFixture<CommentComponent>;

    const deletedComment: Comment = {
        id: 2,
        level: 0,
        user: '',
        time: 1234567890,
        time_ago: '1 hour ago',
        content: '',
        deleted: true,
        comments: [],
    } as Comment;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [CommentComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CommentComponent);
        component = fixture.componentInstance;
        component.comment = deletedComment;
        fixture.detectChanges();
    });

    it('should show deleted message for deleted comments', () => {
        const compiled = fixture.nativeElement;
        const deletedMeta = compiled.querySelector('.deleted-meta');
        expect(deletedMeta).toBeTruthy();
        expect(deletedMeta.textContent).toContain('Comment Deleted');
    });

    it('should not show normal comment content for deleted comments', () => {
        const compiled = fixture.nativeElement;
        const meta = compiled.querySelector('.meta');
        expect(meta).toBeFalsy();
    });
});

describe('CommentComponent with nested comments', () => {
    let component: CommentComponent;
    let fixture: ComponentFixture<CommentComponent>;

    const nestedComment: Comment = {
        id: 3,
        level: 0,
        user: 'parent',
        time: 1234567890,
        time_ago: '3 hours ago',
        content: '<p>Parent comment</p>',
        deleted: false,
        comments: [
            {
                id: 4,
                level: 1,
                user: 'child',
                time: 1234567891,
                time_ago: '2 hours ago',
                content: '<p>Child comment</p>',
                deleted: false,
                comments: [],
            },
        ],
    } as Comment;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [CommentComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CommentComponent);
        component = fixture.componentInstance;
        component.comment = nestedComment;
        fixture.detectChanges();
    });

    it('should render nested comments', () => {
        const compiled = fixture.nativeElement;
        const subtree = compiled.querySelector('.subtree');
        expect(subtree).toBeTruthy();
        const nestedComments = subtree.querySelectorAll('app-comment');
        expect(nestedComments.length).toBe(1);
    });
});
