import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { PollResult } from '../models/poll-result';
import { Story } from '../models/story';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class HackerNewsAPIService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.hnApiBaseUrl;

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.baseUrl}/${feedType}/${page}.json`);
  }

  fetchItemContent(id: number): Observable<Story> {
    return this.http.get<Story>(`${this.baseUrl}/item/${id}.json`).pipe(
      switchMap(story => (story.type === 'poll' && story.poll?.length ? this.fetchPollResults(story) : of(story)))
    );
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return this.http.get<PollResult>(`${this.baseUrl}/item/${id}.json`);
  }

  fetchUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/${id}.json`);
  }

  private fetchPollResults(story: Story): Observable<Story> {
    const optionRequests = story.poll.map((_, index) => this.fetchPollContent(story.id + index + 1));
    return forkJoin(optionRequests).pipe(
      map(poll => ({
        ...story,
        poll,
        poll_votes_count: poll.reduce((votes, option) => votes + option.points, 0),
      }))
    );
  }
}
