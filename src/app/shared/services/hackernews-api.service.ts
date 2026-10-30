import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { PollResult } from '../models/poll-result';
import { Story } from '../models/story';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class HackerNewsAPIService {
  private readonly http = inject(HttpClient);
  readonly baseUrl = 'https://node-hnapi.herokuapp.com';

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  fetchItemContent(id: number): Observable<Story> {
    return this.http.get<Story>(`${this.baseUrl}/item/${id}`).pipe(
      switchMap((story) => {
        if (story.type !== 'poll' || !story.poll?.length) {
          return of(story);
        }
        const pollRequests = story.poll.map((_, i) =>
          this.fetchPollContent(story.id + i + 1).pipe(catchError(() => of(null)))
        );
        return forkJoin(pollRequests).pipe(
          map((results) => {
            const poll = results.filter((result): result is PollResult => result !== null);
            return {
              ...story,
              poll,
              poll_votes_count: poll.reduce((total, result) => total + result.points, 0),
            };
          })
        );
      })
    );
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return this.http.get<PollResult>(`${this.baseUrl}/item/${id}`);
  }

  fetchUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/${id}`);
  }
}
