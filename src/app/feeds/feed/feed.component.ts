import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';
import { ItemComponent } from '../item/item.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ItemComponent, LoaderComponent, ErrorMessageComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {
  typeSub?: Subscription;
  pageSub?: Subscription;
  items?: Story[];
  feedType = '';
  pageNum = 1;
  listStart = 1;
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.typeSub = this.route.data.subscribe((data: Data) => {
      this.feedType = data['feedType'];
    });

    this.pageSub = this.route.params.subscribe((params) => {
      this.pageNum = params['page'] ? +params['page'] : 1;
      this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum).subscribe({
        next: (items) => (this.items = items),
        error: () => (this.errorMessage = 'Could not load ' + this.feedType + ' stories.'),
        complete: () => {
          this.listStart = (this.pageNum - 1) * 30 + 1;
          window.scrollTo(0, 0);
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.typeSub?.unsubscribe();
    this.pageSub?.unsubscribe();
  }
}
