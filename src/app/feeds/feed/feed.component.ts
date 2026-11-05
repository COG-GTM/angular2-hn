import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, combineLatest, map, of, startWith, switchMap, tap } from 'rxjs';

import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { LoadState, loading } from '../../shared/models/load-state';
import { Story } from '../../shared/models/story';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { ItemComponent } from '../item/item.component';

export const PAGE_SIZE = 30;

@Component({
  selector: 'app-feed',
  imports: [RouterLink, RouterLinkActive, LoaderComponent, ErrorMessageComponent, ItemComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(HackerNewsAPIService);

  private readonly params$ = combineLatest([this.route.data, this.route.paramMap]).pipe(
    map(([data, params]) => ({
      feedType: data['feedType'] as string,
      pageNum: Number(params.get('page')) || 1,
    }))
  );
  private readonly params = toSignal(this.params$, { requireSync: true });

  readonly feedType = computed(() => this.params().feedType);
  readonly pageNum = computed(() => this.params().pageNum);
  readonly listStart = computed(() => (this.pageNum() - 1) * PAGE_SIZE + 1);

  readonly feed = toSignal(
    this.params$.pipe(
      switchMap(({ feedType, pageNum }) =>
        this.api.fetchFeed(feedType, pageNum).pipe(
          map((items): LoadState<Story[]> => ({ data: items, error: '' })),
          tap(() => window.scrollTo(0, 0)),
          catchError(() => of<LoadState<Story[]>>({ data: null, error: `Could not load ${feedType} stories.` })),
          startWith(loading<Story[]>())
        )
      )
    ),
    { initialValue: loading<Story[]>() }
  );
}
