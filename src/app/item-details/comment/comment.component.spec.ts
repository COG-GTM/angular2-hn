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
        comments: []
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommentComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(CommentComponent);
        component = fixture.componentInstance;
        component.comment = mockComment;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize collapse to false on ngOnInit', () => {
        component.ngOnInit();
        expect(component.collapse).toBe(false);
    });

    it('should have comment input', () => {
        expect(component.comment).toBe(mockComment);
    });

    it('should have comment with correct properties', () => {
        expect(component.comment.id).toBe(1);
        expect(component.comment.user).toBe('testuser');
        expect(component.comment.content).toBe('This is a test comment');
        expect(component.comment.deleted).toBe(false);
    });
});
