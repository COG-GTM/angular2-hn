import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

function buildComment(id: number, overrides: Partial<Comment> = {}): Comment {
    return {
        id,
        level: 0,
        user: `user${id}`,
        time: 0,
        time_ago: `${id} minutes ago`,
        content: `<p>Comment ${id}</p>`,
        deleted: false,
        comments: [],
        ...overrides,
    };
}

describe('CommentComponent', () => {
    let fixture: ComponentFixture<CommentComponent>;

    const element = (): HTMLElement => fixture.nativeElement;

    function render(comment: Comment) {
        fixture = TestBed.createComponent(CommentComponent);
        fixture.componentInstance.comment = comment;
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [CommentComponent],
        });
    });

    it('should start expanded', () => {
        render(buildComment(1));

        expect(fixture.componentInstance.collapse).toBe(false);
    });

    it('should render the author, age and HTML content', () => {
        render(buildComment(1));

        const author = element().querySelector('.meta a');
        expect(author.textContent).toBe('user1');
        expect(author.getAttribute('href')).toBe('/user/user1');
        expect(element().querySelector('.time').textContent).toBe('1 minutes ago');
        expect(element().querySelector('.comment-text p').textContent).toBe('Comment 1');
    });

    it('should render nested replies recursively', () => {
        render(
            buildComment(1, {
                comments: [buildComment(2, { comments: [buildComment(3)] }), buildComment(4)],
            })
        );

        expect(element().querySelectorAll('app-comment').length).toBe(3);
        expect(element().textContent).toContain('Comment 3');
    });

    it('should collapse and expand the comment tree when the toggle is clicked', () => {
        render(buildComment(1, { comments: [buildComment(2)] }));

        const toggle = element().querySelector('.meta .collapse') as HTMLElement;
        const tree = element().querySelector('.comment-tree > div') as HTMLElement;
        expect(toggle.textContent).toBe('[-]');
        expect(tree.hidden).toBe(false);

        toggle.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.collapse).toBe(true);
        expect(toggle.textContent).toBe('[+]');
        expect(tree.hidden).toBe(true);
        expect(element().querySelector('.meta').classList).toContain('meta-collapse');

        toggle.click();
        fixture.detectChanges();

        expect(toggle.textContent).toBe('[-]');
        expect(tree.hidden).toBe(false);
    });

    it('should render a placeholder for deleted comments', () => {
        render(buildComment(1, { deleted: true }));

        expect(element().querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
        expect(element().querySelector('.meta')).toBeNull();
    });
});
