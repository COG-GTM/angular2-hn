import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import firebase from 'firebase/app';
import 'firebase/database';
import { Story } from '../models/story';

@Injectable({
  providedIn: 'root'
})
export class RealtimeUpdatesService {
  private database: firebase.database.Database;
  private storyUpdatesSubject = new Subject<Story>();
  private initialized = false;

  constructor() {}

  initialize() {
    if (this.initialized) {
      return;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp({
        databaseURL: 'https://hacker-news.firebaseio.com'
      });
    }

    this.database = firebase.database();
    this.initialized = true;
  }

  subscribeToTopStories(feedType: string): Observable<number[]> {
    this.initialize();

    return new Observable(observer => {
      const feedPath = this.getFeedPath(feedType);
      const ref = this.database.ref(feedPath);

      const callback = (snapshot: firebase.database.DataSnapshot) => {
        const storyIds = snapshot.val();
        if (storyIds) {
          observer.next(storyIds);
        }
      };

      ref.on('value', callback);

      return () => {
        ref.off('value', callback);
      };
    });
  }

  subscribeToStory(storyId: number): Observable<Story> {
    this.initialize();

    return new Observable(observer => {
      const ref = this.database.ref(`v0/item/${storyId}`);

      const callback = (snapshot: firebase.database.DataSnapshot) => {
        const story = snapshot.val();
        if (story) {
          observer.next(this.transformFirebaseStory(story));
        }
      };

      ref.on('value', callback);

      return () => {
        ref.off('value', callback);
      };
    });
  }

  getStoryOnce(storyId: number): Promise<Story> {
    this.initialize();

    return this.database.ref(`v0/item/${storyId}`)
      .once('value')
      .then(snapshot => {
        const story = snapshot.val();
        return story ? this.transformFirebaseStory(story) : null;
      });
  }

  getFeedPath(feedType: string): string {
    const feedMap = {
      news: 'v0/topstories',
      newest: 'v0/newstories',
      show: 'v0/showstories',
      ask: 'v0/askstories',
      jobs: 'v0/jobstories'
    };
    return feedMap[feedType] || 'v0/topstories';
  }

  transformFirebaseStory(firebaseStory: any): Story {
    const story = new Story();
    story.id = firebaseStory.id;
    story.title = firebaseStory.title;
    story.points = firebaseStory.score;
    story.user = firebaseStory.by;
    story.time = firebaseStory.time;
    story.time_ago = this.calculateTimeAgo(firebaseStory.time);
    story.type = firebaseStory.type;
    story.url = firebaseStory.url;
    story.domain = this.extractDomain(firebaseStory.url);
    story.comments_count = firebaseStory.descendants || 0;
    story.deleted = firebaseStory.deleted || false;
    story.dead = firebaseStory.dead || false;
    return story;
  }

  calculateTimeAgo(timestamp: number): number {
    const now = Math.floor(Date.now() / 1000);
    return now - timestamp;
  }

  extractDomain(url: string): string {
    if (!url) {
      return '';
    }
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (e) {
      return '';
    }
  }

  cleanup() {
    if (this.database) {
      this.database.goOffline();
    }
  }
}
