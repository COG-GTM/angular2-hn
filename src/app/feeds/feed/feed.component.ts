import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { RealtimeUpdatesService } from '../../shared/services/realtime-updates.service';
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
            this.subscribeToRealtimeUpdates();
          },
          error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            window.scrollTo(0, 0);
          }
        );
    });
  }

  subscribeToRealtimeUpdates() {
    if (this._realtimeUpdatesService.isRealtimeEnabled() && this.pageNum === 1) {
      if (this.realtimeSub) {
        this.realtimeSub.unsubscribe();
      }
      this.realtimeSub = this._realtimeUpdatesService.subscribeToTopStories(this.feedType)
        .subscribe(newStory => {
          if (this.items && newStory) {
            const existingIndex = this.items.findIndex(item => item.id === newStory.id);
            if (existingIndex === -1) {
              this.items.unshift(newStory);
              if (this.items.length > 30) {
                this.items.pop();
              }
            }
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
    this._realtimeUpdatesService.unsubscribe();
  }
}
