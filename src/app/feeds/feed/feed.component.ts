
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { EMPTY, combineLatest } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { Story } from '../../shared/models/story';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { ItemComponent } from '../item/item.component';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  imports: [LoaderComponent, ErrorMessageComponent, ItemComponent, RouterLinkActive, RouterLink],
})
export class FeedComponent implements OnInit {
  private readonly hackerNewsAPIService = inject(HackerNewsAPIService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  items: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';

  ngOnInit() {
    combineLatest([this.route.data, this.route.params])
      .pipe(
        tap(([data, params]) => {
          this.feedType = data['feedType'];
          this.pageNum = params['page'] ? +params['page'] : 1;
          this.items = undefined;
          this.errorMessage = '';
        }),
        switchMap(() =>
          this.hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum).pipe(
            catchError(() => {
              this.errorMessage = 'Could not load ' + this.feedType + ' stories.';
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: items => {
          this.items = items;
          this.listStart = (this.pageNum - 1) * 30 + 1;
          window.scrollTo(0, 0);
        },
      });
  }
}
