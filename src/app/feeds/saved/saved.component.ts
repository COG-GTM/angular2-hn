import { Component } from '@angular/core';

import { SavedStory } from '../../shared/models/saved-story';
import { SavedStoriesService } from '../../shared/services/saved-stories.service';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent {
  // The service's array is shared by reference, so unsaving a story from this view updates the
  // list without a reload.
  savedStories: SavedStory[];

  constructor(private savedStoriesService: SavedStoriesService) {
    this.savedStories = this.savedStoriesService.savedStories;
  }
}
