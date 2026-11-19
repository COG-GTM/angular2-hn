import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';

import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { FeedType } from '../../shared/models/feed-type.type';
import { Story } from '../../shared/models/story';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { ItemComponent } from '../item/item.component';

export const PAGE_SIZE = 30;

@Component({
    selector: 'app-feed',
    imports: [RouterLink, RouterLinkActive, LoaderComponent, ErrorMessageComponent, ItemComponent],
    templateUrl: './feed.component.html',
    styleUrl: './feed.component.scss',
})
export class FeedComponent {
    private readonly api = inject(HackerNewsAPIService);

    /** Bound from route data. */
    readonly feedType = input.required<FeedType>();
    /** Bound from the `:page` route param. */
    readonly page = input<string>();

    readonly pageNum = computed(() => (this.page() ? +this.page()! : 1));
    readonly items = signal<Story[] | undefined>(undefined);
    readonly listStart = signal<number | undefined>(undefined);
    readonly errorMessage = signal('');
    readonly pageSize = PAGE_SIZE;

    private readonly request = computed(() => ({ feedType: this.feedType(), pageNum: this.pageNum() }));

    constructor() {
        toObservable(this.request)
            .pipe(
                switchMap(({ feedType, pageNum }) =>
                    this.api.fetchFeed(feedType, pageNum).pipe(
                        tap({
                            next: (items) => this.items.set(items),
                            complete: () => {
                                this.listStart.set((pageNum - 1) * PAGE_SIZE + 1);
                                window.scrollTo(0, 0);
                            },
                        }),
                        catchError(() => {
                            this.errorMessage.set(`Could not load ${feedType} stories.`);
                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe();
    }
}
