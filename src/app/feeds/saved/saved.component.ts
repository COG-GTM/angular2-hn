import { Component } from '@angular/core';

import { Story } from '../../shared/models/story';
import { SavedPostsService } from '../../shared/services/saved-posts.service';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent {
  constructor(private savedPostsService: SavedPostsService) { }

  get items(): Story[] {
    return this.savedPostsService.getSavedPosts();
  }
}
