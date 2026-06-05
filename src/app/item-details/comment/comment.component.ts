import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Comment } from '../../shared/models/comment';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
  @Input() comment!: Comment;
  collapse = false;
}
