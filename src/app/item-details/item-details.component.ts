import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { Location, NgStyle } from '@angular/common';
import { Subscription } from 'rxjs';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';

import { Story } from '../shared/models/story';
import { Settings } from '../shared/models/settings';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { CommentComponent } from './comment/comment.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [
    NgStyle,
    RouterLink,
    RouterLinkActive,
    CommentPipe,
    CommentComponent,
    LoaderComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss'],
})
export class ItemDetailsComponent implements OnInit, OnDestroy {
  sub?: Subscription;
  item?: Story;
  errorMessage = '';
  settings: Settings;

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private _settingsService: SettingsService,
    private route: ActivatedRoute,
    private _location: Location
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe((params) => {
      const itemID = +params['id'];
      this._hackerNewsAPIService.fetchItemContent(itemID).subscribe({
        next: (item) => (this.item = item),
        error: () => (this.errorMessage = 'Could not load item comments.'),
      });
    });
    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  goBack(): void {
    this._location.back();
  }

  get hasUrl(): boolean {
    return !!this.item && this.item.url.indexOf('http') === 0;
  }
}
