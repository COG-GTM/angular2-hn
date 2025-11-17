import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  items: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route
      .data
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.feedType = (data as any).feedType;
      });

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.pageNum = params['page'] ? +params['page'] : 1;
        this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
          .pipe(takeUntil(this.destroy$))
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
