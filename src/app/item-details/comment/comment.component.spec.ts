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
    } as Comment;

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

    it('should display comment user', () => {
        const compiled = fixture.nativeElement;
        const userLink = compiled.querySelector('.meta a');
        expect(userLink.textContent).toContain('testuser');
    });

    it('should display comment time_ago', () => {
        const compiled = fixture.nativeElement;
        const timeSpan = compiled.querySelector('.time');
        expect(timeSpan.textContent).toContain('2 hours ago');
    });

    it('should not display deleted comment content', () => {
        component.comment = { ...mockComment, deleted: true } as Comment;
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const deletedMeta = compiled.querySelector('.deleted-meta');
        expect(deletedMeta).toBeTruthy();
    });

    it('should display comment content via innerHTML', () => {
        const compiled = fixture.nativeElement;
        const commentText = compiled.querySelector('.comment-text');
        expect(commentText.innerHTML).toContain('This is a test comment');
    });
});
