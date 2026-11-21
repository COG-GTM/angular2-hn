import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { SavedStoriesService } from '../shared/services/saved-stories.service';

import { Story } from '../shared/models/story';
import { Settings } from '../shared/models/settings';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})
export class ItemDetailsComponent implements OnInit {
  sub: Subscription;
  item: Story;
  errorMessage = '';
  settings: Settings;
  showingCachedCopy = false;
  private currentId: number;
  private fetchSub: Subscription;

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private _settingsService: SettingsService,
    private savedStoriesService: SavedStoriesService,
    private route: ActivatedRoute,
    private _location: Location
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      const itemID = +params['id'];
      this.currentId = itemID;
      this.item = undefined;
      this.errorMessage = '';
      this.showingCachedCopy = false;
      if (this.fetchSub) {
        this.fetchSub.unsubscribe();
      }
      this.fetchSub = this._hackerNewsAPIService.fetchItemContent(itemID).subscribe(item => {
        this.item = item;
        this.savedStoriesService.refresh(item).catch(() => {});
      }, () => this.loadCachedCopy(itemID));
    });
    window.scrollTo(0, 0);
  }

  loadCachedCopy(itemID: number) {
    const failed = 'Could not load item comments.';
    this.savedStoriesService.getCachedItem(itemID).then(
      cached => {
        if (itemID !== this.currentId) {
          return;
        }
        if (cached) {
          this.item = cached;
          this.showingCachedCopy = true;
        } else if (this.savedStoriesService.isSaved(itemID)) {
          this.errorMessage =
            `${failed} This saved story wasn't downloaded for offline reading yet; it will be the next time you're online.`;
        } else {
          this.errorMessage = failed;
        }
      },
      () => {
        if (itemID === this.currentId) {
          this.errorMessage = failed;
        }
      }
    );
  }

  goBack() {
    this._location.back();
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

}
