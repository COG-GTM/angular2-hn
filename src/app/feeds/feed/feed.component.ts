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
  private seenStoryIds = new Set<number>();

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
      this.pageNum = params['page'] ? +params['page'] : 1;
      this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
        .subscribe(
          items => {
            this.items = items;
            this.seenStoryIds.clear();
            if (items) {
              items.forEach(item => this.seenStoryIds.add(item.id));
            }
          },
          error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            window.scrollTo(0, 0);
            this.setupRealtimeUpdates();
          }
        );
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
    if (this.feedType) {
      this._realtimeUpdatesService.unsubscribeFromNewStories(this.feedType);
    }
  }

  private setupRealtimeUpdates() {
    if (!this._settingsService.settings.realtimeUpdates || this.pageNum !== 1) {
      return;
    }

    this.realtimeSub = this._realtimeUpdatesService
      .subscribeToNewStories(this.feedType)
      .subscribe(storyId => {
        if (!this.seenStoryIds.has(storyId)) {
          this.seenStoryIds.add(storyId);
          this._realtimeUpdatesService.fetchStoryDetails(storyId).subscribe(
            story => {
              if (story && this.items) {
                this.items.unshift(story);
                if (this.items.length > 30) {
                  this.items.pop();
                }
              }
            },
            error => console.error('Error fetching story details:', error)
          );
        }
      });
  }
}
