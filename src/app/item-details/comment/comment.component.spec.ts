import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [CommentComponent],
        }).compileComponents();
    }));

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

    it('should render user name', () => {
        const compiled = fixture.nativeElement;
        const userLink = compiled.querySelector('.meta a');
        expect(userLink.textContent).toContain('testuser');
    });

    it('should render time ago', () => {
        const compiled = fixture.nativeElement;
        const time = compiled.querySelector('.time');
        expect(time.textContent).toContain('2 hours ago');
    });

    it('should render comment content', () => {
        const compiled = fixture.nativeElement;
        const commentText = compiled.querySelector('.comment-text');
        expect(commentText.innerHTML).toContain('This is a test comment');
    });

    it('should render collapse toggle showing [-]', () => {
        const compiled = fixture.nativeElement;
        const collapseBtn = compiled.querySelector('.collapse');
        expect(collapseBtn.textContent).toContain('[-]');
    });

    it('should show [+] when collapsed', () => {
        component.collapse = true;
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const collapseBtn = compiled.querySelector('.collapse');
        expect(collapseBtn.textContent).toContain('[+]');
    });

    it('should hide comment tree when collapsed', () => {
        component.collapse = true;
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const hiddenDiv = compiled.querySelector('.comment-tree div');
        expect(hiddenDiv.hidden).toBe(true);
    });

    it('should show comment tree when not collapsed', () => {
        component.collapse = false;
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const hiddenDiv = compiled.querySelector('.comment-tree div');
        expect(hiddenDiv.hidden).toBe(false);
    });

    it('should show deleted message for deleted comments', () => {
        component.comment = { ...mockComment, deleted: true };
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.deleted-meta')).toBeTruthy();
        expect(compiled.textContent).toContain('Comment Deleted');
    });

    it('should not show regular comment for deleted comments', () => {
        component.comment = { ...mockComment, deleted: true };
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.meta')).toBeFalsy();
    });

    it('should render sub-comments', () => {
        const commentWithSubs: Comment = {
            ...mockComment,
            comments: [
                {
                    id: 2,
                    level: 1,
                    user: 'subuser',
                    time: 1234567890,
                    time_ago: '1 hour ago',
                    content: '<p>Sub comment</p>',
                    deleted: false,
                    comments: [],
                },
            ],
        };
        component.comment = commentWithSubs;
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const subComments = compiled.querySelectorAll('app-comment');
        expect(subComments.length).toBe(1);
    });
});
