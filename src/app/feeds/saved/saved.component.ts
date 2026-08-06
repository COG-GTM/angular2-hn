import { Component, OnInit } from '@angular/core';

import { SavedPostsService } from '../../shared/services/saved-posts.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent implements OnInit {
  items: Story[];

  constructor(private _savedPostsService: SavedPostsService) { }

  ngOnInit() {
    this.items = this._savedPostsService.getSavedPosts();
    window.scrollTo(0, 0);
  }
}
