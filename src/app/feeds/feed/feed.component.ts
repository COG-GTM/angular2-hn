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
  private lastKnownTopStoryId: number;

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
        this.setupRealtimeUpdates();
      });

    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params['page'] ? +params['page'] : 1;
      this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
        .subscribe(
          items => {
            this.items = items;
            if (items && items.length > 0) {
              this.lastKnownTopStoryId = items[0].id;
            }
          },
          error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            window.scrollTo(0, 0);
          }
        );
    });
  }

  setupRealtimeUpdates() {
    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
    }

    if (this._settingsService.settings.realtimeUpdates && this.pageNum === 1) {
      this.realtimeSub = this._realtimeUpdatesService.subscribeToFeed(this.feedType)
        .subscribe(topStoryId => {
          if (this.lastKnownTopStoryId && topStoryId !== this.lastKnownTopStoryId) {
            this._realtimeUpdatesService.getStoryDetails(topStoryId).subscribe(storyData => {
              if (storyData && this.items) {
                const newStory: Story = {
                  id: storyData.id,
                  title: storyData.title,
                  points: storyData.score,
                  user: storyData.by,
                  time: storyData.time,
                  time_ago: Math.floor((Date.now() / 1000 - storyData.time) / 60),
                  type: storyData.type,
                  url: storyData.url,
                  domain: storyData.url ? new URL(storyData.url).hostname : '',
                  comments: [],
                  comments_count: storyData.descendants || 0,
                  poll: [],
                  poll_votes_count: 0,
                  deleted: storyData.deleted || false,
                  dead: storyData.dead || false
                };
                this.items = [newStory, ...this.items.slice(0, 29)];
                this.lastKnownTopStoryId = topStoryId;
              }
            });
          } else if (!this.lastKnownTopStoryId) {
            this.lastKnownTopStoryId = topStoryId;
          }
        });
    }
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
    this._realtimeUpdatesService.unsubscribeAll();
  }
}
