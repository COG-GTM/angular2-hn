import { Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Comment } from '../../shared/models/comment';

@Component({
    selector: 'app-comment',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './comment.component.html',
    styleUrl: './comment.component.scss',
})
export class CommentComponent {
    readonly comment = input.required<Comment>();
    readonly collapse = signal(false);

    toggleCollapse(): void {
        this.collapse.update((collapse) => !collapse);
    }
}
