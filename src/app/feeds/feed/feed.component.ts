import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { BookmarksService } from '../../shared/services/bookmarks.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent implements OnInit {
  typeSub: Subscription;
  pageSub: Subscription;
  items: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private _bookmarksService: BookmarksService,
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
      if (this.feedType === 'saved') {
        this.items = this._bookmarksService.getPage(this.pageNum);
        this.listStart = ((this.pageNum - 1) * 30) + 1;
        window.scrollTo(0, 0);
        return;
      }
      this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
        .subscribe(
          items => this.items = items,
          error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            window.scrollTo(0, 0);
          }
        );
    });
  }

  get displayItems(): Story[] {
    return this.feedType === 'saved' ? this._bookmarksService.getPage(this.pageNum) : this.items;
  }

  get isSavedEmpty(): boolean {
    return this.feedType === 'saved' && this._bookmarksService.savedStories.length === 0;
  }

  get hasMore(): boolean {
    if (this.feedType === 'saved') {
      return this._bookmarksService.savedStories.length > this.pageNum * 30;
    }
    return !!this.items && this.items.length === 30;
  }
}
