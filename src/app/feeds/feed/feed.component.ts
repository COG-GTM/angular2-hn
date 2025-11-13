import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { RealtimeUpdatesService } from '../../shared/services/realtime-updates.service';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent implements OnInit, OnDestroy {
  typeSub: Subscription;
  pageSub: Subscription;
  realtimeSub: Subscription;
  items: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private _realtimeUpdatesService: RealtimeUpdatesService,
    private _settingsService: SettingsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.typeSub = this.route
      .data
      .subscribe(data => {
        this.feedType = (data as any).feedType;
      });

    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params.page ? +params.page : 1;

      if (this._settingsService.getRealtimeUpdates() && this.pageNum === 1) {
        this.subscribeToRealtimeUpdates();
      } else {
        this.fetchFeedFromAPI();
      }
    });
  }

  private fetchFeedFromAPI() {
    this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
      .subscribe(
        items => this.items = items,
        error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
        () => {
          this.listStart = ((this.pageNum - 1) * 30) + 1;
          window.scrollTo(0, 0);
        }
      );
  }

  private subscribeToRealtimeUpdates() {
    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
    }

    this.realtimeSub = this._realtimeUpdatesService.subscribeToTopStories(this.feedType)
      .subscribe(
        storyIds => {
          const topStoryIds = storyIds.slice(0, 30);
          this.loadStoriesFromIds(topStoryIds);
        },
        error => {
          this.errorMessage = 'Could not load realtime updates. Falling back to API.';
          this.fetchFeedFromAPI();
        }
      );
  }

  private loadStoriesFromIds(storyIds: number[]) {
    const storyPromises = storyIds.map(id => this._realtimeUpdatesService.getStoryOnce(id));

    Promise.all(storyPromises)
      .then(stories => {
        this.items = stories.filter(story => story !== null);
        this.listStart = ((this.pageNum - 1) * 30) + 1;
      })
      .catch(error => {
        this.errorMessage = 'Could not load stories. Falling back to API.';
        this.fetchFeedFromAPI();
      });
  }

  ngOnDestroy() {
    if (this.typeSub) {
      this.typeSub.unsubscribe();
    }
    if (this.pageSub) {
      this.pageSub.unsubscribe();
    }
    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
    }
  }
}
