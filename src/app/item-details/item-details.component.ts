import { Location } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { EMPTY, catchError, switchMap } from 'rxjs';

import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { Story } from '../shared/models/story';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { CommentComponent } from './comment/comment.component';

@Component({
    selector: 'app-item-details',
    imports: [RouterLink, RouterLinkActive, LoaderComponent, ErrorMessageComponent, CommentComponent, CommentPipe],
    templateUrl: './item-details.component.html',
    styleUrl: './item-details.component.scss',
})
export class ItemDetailsComponent {
    private readonly hackerNewsAPIService = inject(HackerNewsAPIService);
    private readonly location = inject(Location);

    readonly id = input.required<string>();
    readonly settings = inject(SettingsService).settings;
    readonly item = signal<Story | undefined>(undefined);
    readonly errorMessage = signal('');
    readonly hasUrl = computed(() => this.item()?.url.indexOf('http') === 0);

    constructor() {
        toObservable(this.id)
            .pipe(
                switchMap((id) =>
                    this.hackerNewsAPIService.fetchItemContent(+id).pipe(
                        catchError(() => {
                            this.errorMessage.set('Could not load item comments.');
                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe((item) => this.item.set(item));
        window.scrollTo(0, 0);
    }

    goBack(): void {
        this.location.back();
    }
}
