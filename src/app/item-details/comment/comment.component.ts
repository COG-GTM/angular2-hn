import { Component, Input, OnInit } from '@angular/core';

import { Comment } from '../../shared/models/comment';

import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-comment',
  imports: [NgIf, NgFor, RouterLink, RouterLinkActive],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  @Input() comment: Comment;
  collapse: boolean;

  constructor() {}

  ngOnInit() {
    this.collapse = false;
  }
}
