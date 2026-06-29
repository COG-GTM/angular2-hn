import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

import { Story } from '../shared/models/story';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SavedItemsService } from '../shared/services/saved-items.service';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent implements OnInit {
  items: Story[];
  loading = true;
  errorMessage = '';

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private _savedItemsService: SavedItemsService
  ) {}

  ngOnInit() {
    this.loadSavedItems();
  }

  loadSavedItems() {
    const ids = this._savedItemsService.getSavedIds();

    if (ids.length === 0) {
      this.items = [];
      this.loading = false;
      return;
    }

    const requests: Observable<Story>[] = ids.map(
      id => this._hackerNewsAPIService.fetchItemContent(id)
    );

    forkJoin(requests).subscribe(
      stories => {
        this.items = stories;
        this.loading = false;
      },
      () => {
        this.errorMessage = 'Could not load your saved posts.';
        this.loading = false;
      }
    );
  }
}
