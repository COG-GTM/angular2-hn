import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { Story } from '../shared/models/story';

@Component({
  selector: 'app-weekly-summary',
  templateUrl: './weekly-summary.component.html',
  styleUrls: ['./weekly-summary.component.scss']
})
export class WeeklySummaryComponent implements OnInit, OnDestroy {
  items: Story[];
  errorMessage = '';
  private summarySub: Subscription;

  constructor(private _hackerNewsAPIService: HackerNewsAPIService) { }

  ngOnInit() {
    this.summarySub = this._hackerNewsAPIService.fetchWeeklySummary()
      .subscribe(
        items => this.items = items,
        error => this.errorMessage = 'Could not load this week\'s top stories.',
        () => window.scrollTo(0, 0)
      );
  }

  ngOnDestroy() {
    if (this.summarySub) {
      this.summarySub.unsubscribe();
    }
  }
}
