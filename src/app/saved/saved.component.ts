import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SavedStoriesService } from '../shared/services/saved-stories.service';
import { SettingsService } from '../shared/services/settings.service';
import { SavedStory } from '../shared/models/saved-story';
import { Settings } from '../shared/models/settings';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent implements OnInit {
  stories$: Observable<SavedStory[]>;
  loaded$: Observable<boolean>;
  settings: Settings;

  constructor(private savedStoriesService: SavedStoriesService, private settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.stories$ = this.savedStoriesService.stories$;
    this.loaded$ = this.savedStoriesService.loaded$;
    window.scrollTo(0, 0);
  }

  hasUrl(story: SavedStory): boolean {
    return !!story.url && story.url.indexOf('http') === 0;
  }

  domain(story: SavedStory): string {
    if (!this.hasUrl(story)) {
      return '';
    }
    try {
      return new URL(story.url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }

  trackById(_: number, story: SavedStory): number {
    return story.id;
  }
}
