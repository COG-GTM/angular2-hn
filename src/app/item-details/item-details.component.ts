import { Location, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { CommentComponent } from './comment/comment.component';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss'],
  imports: [
    NgIf,
    LoaderComponent,
    ErrorMessageComponent,
    RouterLinkActive,
    RouterLink,
    NgFor,
    NgStyle,
    CommentComponent,
    CommentPipe,
  ],
})
export class ItemDetailsComponent implements OnInit {
  private readonly hackerNewsAPIService = inject(HackerNewsAPIService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  item: Story;
  errorMessage = '';
  settings: Settings = inject(SettingsService).settings;

  ngOnInit() {
    this.route.params
      .pipe(
        map(params => +params['id']),
        switchMap(itemID =>
          this.hackerNewsAPIService.fetchItemContent(itemID).pipe(
            catchError(() => {
              this.errorMessage = 'Could not load item comments.';
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: item => (this.item = item),
      });
    window.scrollTo(0, 0);
  }

  goBack() {
    this.location.back();
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }
}
