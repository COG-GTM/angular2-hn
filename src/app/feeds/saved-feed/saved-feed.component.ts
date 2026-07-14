import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { SavedPostsService } from '../../shared/services/saved-posts.service';
import { SavedPost } from '../../shared/models/saved-post';

@Component({
  selector: 'app-saved-feed',
  templateUrl: './saved-feed.component.html',
  styleUrls: ['./saved-feed.component.scss']
})
export class SavedFeedComponent implements OnInit, OnDestroy {
  pageSize = 30;
  pageNum: number;
  listStart: number;
  pageSub: Subscription;

  constructor(
    private _savedPostsService: SavedPostsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params.page ? +params.page : 1;
      this.listStart = ((this.pageNum - 1) * this.pageSize) + 1;
      window.scrollTo(0, 0);
    });
  }

  ngOnDestroy() {
    if (this.pageSub) {
      this.pageSub.unsubscribe();
    }
  }

  get savedPosts(): SavedPost[] {
    return this._savedPostsService.savedPosts;
  }

  get items(): SavedPost[] {
    const start = (this.pageNum - 1) * this.pageSize;
    return this.savedPosts.slice(start, start + this.pageSize);
  }

  get hasNextPage(): boolean {
    return this.savedPosts.length > this.pageNum * this.pageSize;
  }
}
