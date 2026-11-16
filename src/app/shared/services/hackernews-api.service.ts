import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import fetch from 'unfetch';
import {map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

// wrap fetch in observable so we can keep it chill
@Injectable()
export class HackerNewsAPIService {
  baseUrl: string;

  constructor() {
    this.baseUrl = 'https://node-hnapi.herokuapp.com';
  }

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    const url = `${this.baseUrl}/${feedType}?page=${page}`;
    return takePrefetchedFeed<Story[]>(url) || lazyFetch(url);
  }

  fetchItemContent(id: number): Observable<Story> {
    return lazyFetch(`${this.baseUrl}/item/${id}`).pipe(map((story: Story) => {
      if (story.type === 'poll') {
        let numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        for (let i = 1; i <= numberOfPollOptions; i++) {
          this.fetchPollContent(story.id + i).subscribe(pollResults => {
            story.poll[i - 1] = pollResults;
            story.poll_votes_count += pollResults.points;
          });
        }
      }
      return story;
    }));
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return lazyFetch(`${this.baseUrl}/item/${id}`);
  }

  fetchUser(id: string): Observable<User> {
    return lazyFetch(`${this.baseUrl}/user/${id}`);
  }
}

function lazyFetch<T>(url, options?) {
  return new Observable<T>(fetchObserver => {
    let cancelToken = false;
    fetch(url, options)
      .then(res => {
        if (!cancelToken) {
          return res.json()
            .then(data => {
              fetchObserver.next(data);
              fetchObserver.complete();
            });
        }
      }).catch(err => fetchObserver.error(err));
    return () => {
      cancelToken = true;
    };
  });
}

// Single-use hand-off of the feed request started by the inline script in index.html.
// Falls back to a normal fetch if that request failed.
function takePrefetchedFeed<T>(url: string): Observable<T> | null {
  const prefetch = (window as any).__hnFeedPrefetch;
  if (!prefetch || prefetch.url !== url) {
    return null;
  }
  delete (window as any).__hnFeedPrefetch;
  return new Observable<T>(observer => {
    let fallback: Subscription;
    let cancelToken = false;
    // Promise.resolve adopts the native promise into the Angular zone so change detection runs.
    Promise.resolve(prefetch.data).then(
      data => {
        if (!cancelToken) {
          observer.next(data);
          observer.complete();
        }
      },
      () => {
        if (!cancelToken) {
          fallback = lazyFetch<T>(url).subscribe(observer);
        }
      }
    );
    return () => {
      cancelToken = true;
      if (fallback) {
        fallback.unsubscribe();
      }
    };
  });
}
