import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, Database } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class RealtimeUpdatesService {
  private firebaseApp: FirebaseApp;
  private database: Database;
  private updateSubject = new Subject<number>();
  private subscriptions: Map<string, any> = new Map();

  constructor() {
    this.firebaseApp = initializeApp({
      databaseURL: 'https://hacker-news.firebaseio.com'
    }, 'hn-realtime');
    this.database = getDatabase(this.firebaseApp);
  }

  subscribeToFeed(feedType: string): Observable<number> {
    const feedRef = ref(this.database, `v0/${feedType}stories`);

    const callback = (snapshot) => {
      const stories = snapshot.val();
      if (stories && stories.length > 0) {
        this.updateSubject.next(stories[0]);
      }
    };

    onValue(feedRef, callback);
    this.subscriptions.set(feedType, { ref: feedRef, callback });

    return this.updateSubject.asObservable();
  }

  unsubscribeFromFeed(feedType: string): void {
    const subscription = this.subscriptions.get(feedType);
    if (subscription) {
      off(subscription.ref, 'value', subscription.callback);
      this.subscriptions.delete(feedType);
    }
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription, feedType) => {
      off(subscription.ref, 'value', subscription.callback);
    });
    this.subscriptions.clear();
  }

  getStoryDetails(storyId: number): Observable<any> {
    return new Observable(observer => {
      const storyRef = ref(this.database, `v0/item/${storyId}`);

      const callback = (snapshot) => {
        const story = snapshot.val();
        if (story) {
          observer.next(story);
          observer.complete();
        }
      };

      onValue(storyRef, callback, { onlyOnce: true });

      return () => {
        off(storyRef, 'value', callback);
      };
    });
  }
}
