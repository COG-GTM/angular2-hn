import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLinkActive, RouterLink } from '@angular/router';
import { Location, NgStyle } from '@angular/common';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';

import { Story } from '../shared/models/story';
import { Settings } from '../shared/models/settings';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { CommentComponent } from './comment/comment.component';
import { CommentPipe } from '../shared/pipes/comment.pipe';

@Component({
    selector: 'app-item-details',
    templateUrl: './item-details.component.html',
    styleUrls: ['./item-details.component.scss'],
    imports: [LoaderComponent, ErrorMessageComponent, RouterLinkActive, RouterLink, NgStyle, CommentComponent, CommentPipe]
})
export class ItemDetailsComponent implements OnInit {
  private _hackerNewsAPIService = inject(HackerNewsAPIService);
  private _settingsService = inject(SettingsService);
  private route = inject(ActivatedRoute);
  private _location = inject(Location);

  private destroyRef = inject(DestroyRef);

  readonly item = signal<Story | undefined>(undefined);
  readonly errorMessage = signal('');
  readonly hasUrl = computed(() => this.item()?.url.indexOf('http') === 0);
  settings: Settings;

  constructor() {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const itemID = +params['id'];
        this._hackerNewsAPIService.fetchItemContent(itemID)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: item => this.item.set(item),
            error: () => this.errorMessage.set('Could not load item comments.')
          });
      });
    window.scrollTo(0, 0);
  }

  goBack() {
    this._location.back();
  }

}
