import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onChildAdded, off, Database } from 'firebase/database';

import { Story } from '../models/story';
import { HackerNewsAPIService } from './hackernews-api.service';

@Injectable({
  providedIn: 'root'
})
export class RealtimeUpdatesService {
  private firebaseApp: FirebaseApp;
  private database: Database;
  private newStoriesSubject = new Subject<Story>();
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  private activeSubscriptions: Map<string, any> = new Map();

  constructor(private hackerNewsAPIService: HackerNewsAPIService) {
    this.firebaseApp = initializeApp({
      databaseURL: 'https://hacker-news.firebaseio.com'
    });
    this.database = getDatabase(this.firebaseApp);
  }

  subscribeToFeed(feedType: string): Observable<Story> {
    const feedPath = this.getFeedPath(feedType);
    if (this.activeSubscriptions.has(feedType)) {
      return this.newStoriesSubject.asObservable();
    }

    const feedRef = ref(this.database, feedPath);
    let isInitialLoad = true;
    let initialItemCount = 0;
    const maxInitialItems = 30;

    const unsubscribe = onChildAdded(feedRef, (snapshot) => {
      if (isInitialLoad) {
        initialItemCount++;
        if (initialItemCount >= maxInitialItems) {
          isInitialLoad = false;
        }
        return;
      }

      const storyId = snapshot.val();
      if (storyId) {
        this.hackerNewsAPIService.fetchItemContent(storyId).subscribe(
          (story: Story) => {
            if (story && !story.deleted && !story.dead) {
              this.newStoriesSubject.next(story);
            }
          },
          (error) => {
            console.error('Error fetching story details:', error);
          }
        );
      }
    });

    this.activeSubscriptions.set(feedType, { ref: feedRef, unsubscribe });
    this.isConnectedSubject.next(true);

    return this.newStoriesSubject.asObservable();
  }

  unsubscribeFromFeed(feedType: string): void {
    const subscription = this.activeSubscriptions.get(feedType);
    if (subscription) {
      off(subscription.ref);
      this.activeSubscriptions.delete(feedType);
    }

    if (this.activeSubscriptions.size === 0) {
      this.isConnectedSubject.next(false);
    }
  }

  unsubscribeAll(): void {
    this.activeSubscriptions.forEach((subscription, feedType) => {
      off(subscription.ref);
    });
    this.activeSubscriptions.clear();
    this.isConnectedSubject.next(false);
  }

  isConnected(): Observable<boolean> {
    return this.isConnectedSubject.asObservable();
  }

  private getFeedPath(feedType: string): string {
    const feedMap: { [key: string]: string } = {
      news: 'v0/newstories',
      newest: 'v0/newstories',
      show: 'v0/showstories',
      ask: 'v0/askstories',
      jobs: 'v0/jobstories',
      top: 'v0/topstories',
      best: 'v0/beststories'
    };

    return feedMap[feedType] || 'v0/newstories';
  }
}
