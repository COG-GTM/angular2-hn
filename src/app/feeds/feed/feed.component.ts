import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, combineLatest, EMPTY, switchMap, tap } from 'rxjs';

import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { Story } from '../../shared/models/story';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { ItemComponent } from '../item/item.component';

export const PAGE_SIZE = 30;

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoaderComponent, ErrorMessageComponent, ItemComponent, RouterLinkActive, RouterLink],
})
export class FeedComponent {
  private readonly api = inject(HackerNewsAPIService);
  private readonly route = inject(ActivatedRoute);

  readonly pageSize = PAGE_SIZE;
  readonly items = signal<Story[] | undefined>(undefined);
  readonly feedType = signal('');
  readonly pageNum = signal(1);
  readonly listStart = signal(1);
  readonly errorMessage = signal('');

  constructor() {
    combineLatest([this.route.data, this.route.paramMap])
      .pipe(
        tap(([data, params]) => {
          this.feedType.set(data['feedType']);
          this.pageNum.set(params.has('page') ? Number(params.get('page')) : 1);
        }),
        switchMap(() =>
          this.api.fetchFeed(this.feedType(), this.pageNum()).pipe(
            catchError(() => {
              this.errorMessage.set(`Could not load ${this.feedType()} stories.`);
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((items) => {
        this.items.set(items);
        this.listStart.set((this.pageNum() - 1) * PAGE_SIZE + 1);
        window.scrollTo(0, 0);
      });
  }
}
