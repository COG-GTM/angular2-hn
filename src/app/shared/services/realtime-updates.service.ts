import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import firebase from 'firebase/app';
import 'firebase/database';
import { Story } from '../models/story';
import { HackerNewsAPIService } from './hackernews-api.service';

@Injectable({
  providedIn: 'root'
})
export class RealtimeUpdatesService {
  private database: firebase.database.Database;
  private newStoriesSubject = new Subject<number>();
  private isInitialized = false;

  constructor(private hackerNewsAPIService: HackerNewsAPIService) {
    if (!firebase.apps.length) {
      firebase.initializeApp({
        databaseURL: 'https://hacker-news.firebaseio.com'
      });
    }
    this.database = firebase.database();
  }

  subscribeToNewStories(feedType: string): Observable<number> {
    if (this.isInitialized) {
      return this.newStoriesSubject.asObservable();
    }

    this.isInitialized = true;
    const feedPath = this.getFeedPath(feedType);
    const storiesRef = this.database.ref(feedPath);

    storiesRef.on('child_added', (snapshot) => {
      const storyId = snapshot.val();
      if (storyId) {
        this.newStoriesSubject.next(storyId);
      }
    });

    return this.newStoriesSubject.asObservable();
  }

  unsubscribeFromNewStories(feedType: string): void {
    const feedPath = this.getFeedPath(feedType);
    const storiesRef = this.database.ref(feedPath);
    storiesRef.off('child_added');
    this.isInitialized = false;
  }

  fetchStoryDetails(storyId: number): Observable<Story> {
    return this.hackerNewsAPIService.fetchItemContent(storyId);
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
}
