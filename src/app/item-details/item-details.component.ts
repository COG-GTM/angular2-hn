import { Location, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, EMPTY, switchMap } from 'rxjs';

import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { Story } from '../shared/models/story';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { CommentComponent } from './comment/comment.component';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoaderComponent, ErrorMessageComponent, RouterLinkActive, RouterLink, NgStyle, CommentComponent, CommentPipe],
})
export class ItemDetailsComponent {
  private readonly api = inject(HackerNewsAPIService);
  private readonly location = inject(Location);

  readonly settings = inject(SettingsService).settings;
  readonly item = signal<Story | undefined>(undefined);
  readonly errorMessage = signal('');
  readonly hasUrl = computed(() => this.item()?.url?.indexOf('http') === 0);

  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(
        switchMap((params) =>
          this.api.fetchItemContent(Number(params.get('id'))).pipe(
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

  goBack() {
    this.location.back();
  }
}
