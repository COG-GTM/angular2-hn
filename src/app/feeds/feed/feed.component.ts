import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, RouterLinkActive, RouterLink } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';
import { ItemComponent } from '../item/item.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-feed',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss'],
    standalone: true,
    imports: [NgIf, LoaderComponent, ErrorMessageComponent, NgFor, ItemComponent, RouterLinkActive, RouterLink]
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
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.typeSub = this.route
      .data
      .subscribe(data => {
        this.feedType = data['feedType'];
      });

    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params['page'] ? +params['page'] : 1;
      this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
        .subscribe({
          next: items => this.items = items,
          error: () => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          complete: () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            window.scrollTo(0, 0);
          }
        });
    });
  }
}
