import { Injectable } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { Story } from '../models/story';
import { HackerNewsAPIService } from './hackernews-api.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class RealtimeUpdatesService {
  private database: any;
  private updateSubject = new Subject<Story>();
  private topStoriesRef: any;
  private lastKnownTopStories: number[] = [];
  private isSubscribed = false;

  constructor(
    private hackerNewsAPIService: HackerNewsAPIService,
    private settingsService: SettingsService
  ) {
    const firebaseConfig = {
      databaseURL: 'https://hacker-news.firebaseio.com'
    };
    const app = initializeApp(firebaseConfig);
    this.database = getDatabase(app);
  }

  subscribeToTopStories(feedType: string): Observable<Story> {
    if (this.isSubscribed) {
      return this.updateSubject.asObservable();
    }

    this.isSubscribed = true;
    const feedPath = this.getFeedPath(feedType);
    this.topStoriesRef = ref(this.database, feedPath);

    onValue(this.topStoriesRef, (snapshot) => {
      const currentTopStories: number[] = snapshot.val() || [];

      if (this.lastKnownTopStories.length > 0) {
        const newStoryIds = currentTopStories.filter(
          id => !this.lastKnownTopStories.includes(id)
        );

        newStoryIds.forEach(storyId => {
          this.hackerNewsAPIService.fetchItemContent(storyId).subscribe(
            story => {
              if (story) {
                this.updateSubject.next(story);
              }
            }
          );
        });
      }

      this.lastKnownTopStories = currentTopStories.slice(0, 30);
    });

    return this.updateSubject.asObservable();
  }

  unsubscribe() {
    if (this.topStoriesRef) {
      off(this.topStoriesRef);
      this.isSubscribed = false;
      this.lastKnownTopStories = [];
    }
  }

  private getFeedPath(feedType: string): string {
    switch (feedType) {
      case 'news':
        return 'v0/topstories';
      case 'newest':
        return 'v0/newstories';
      case 'show':
        return 'v0/showstories';
      case 'ask':
        return 'v0/askstories';
      case 'jobs':
        return 'v0/jobstories';
      default:
        return 'v0/topstories';
    }
  }

  isRealtimeEnabled(): boolean {
    return this.settingsService.settings.realtimeUpdates;
  }
}
