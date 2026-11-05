import { Component, computed, inject } from '@angular/core';
import { Location, NgStyle } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { LoadState, loading } from '../shared/models/load-state';
import { Story } from '../shared/models/story';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { CommentComponent } from './comment/comment.component';

@Component({
  selector: 'app-item-details',
  imports: [NgStyle, RouterLink, RouterLinkActive, LoaderComponent, ErrorMessageComponent, CommentComponent, CommentPipe],
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss'],
})
export class ItemDetailsComponent {
  private readonly api = inject(HackerNewsAPIService);
  private readonly location = inject(Location);
  readonly settings = inject(SettingsService).settings;

  readonly state = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map(params => Number(params.get('id'))),
      switchMap(id =>
        this.api.fetchItemContent(id).pipe(
          map((item): LoadState<Story> => ({ data: item, error: '' })),
          catchError(() => of<LoadState<Story>>({ data: null, error: 'Could not load item comments.' })),
          startWith(loading<Story>())
        )
      )
    ),
    { initialValue: loading<Story>() }
  );

  readonly hasUrl = computed(() => this.state().data?.url.startsWith('http') ?? false);

  constructor() {
    window.scrollTo(0, 0);
  }

  goBack() {
    this.location.back();
  }
}
