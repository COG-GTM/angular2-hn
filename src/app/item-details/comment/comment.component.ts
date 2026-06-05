import { Component, Input, OnInit } from '@angular/core';

import { Comment } from '../../shared/models/comment';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss'],
    standalone: true,
    imports: [NgIf, RouterLinkActive, RouterLink, NgFor]
})
export class CommentComponent implements OnInit {
  @Input() comment: Comment;
  collapse: boolean;

  constructor() {}

  ngOnInit() {
    this.collapse = false;
  }
}
