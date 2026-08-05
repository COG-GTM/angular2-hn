
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Comment } from '../../shared/models/comment';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  imports: [RouterLinkActive, RouterLink],
})
export class CommentComponent {
  @Input() comment: Comment;

  collapse = false;
}
