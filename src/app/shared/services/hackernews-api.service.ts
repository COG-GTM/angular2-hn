import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

import { FeedType } from '../models/feed-type.type';
import { PollResult } from '../models/poll-result';
import { Story } from '../models/story';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class HackerNewsAPIService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'https://node-hnapi.herokuapp.com';
    // node-hnapi dropped /user; HNPWA serves the same shape.
    private readonly userBaseUrl = 'https://api.hnpwa.com/v0';

    fetchFeed(feedType: FeedType, page: number): Observable<Story[]> {
        return this.http.get<Story[]>(`${this.baseUrl}/${feedType}?page=${page}`);
    }

    fetchItemContent(id: number): Observable<Story> {
        return this.http.get<Story>(`${this.baseUrl}/item/${id}`).pipe(
            switchMap((story) => {
                if (story.type !== 'poll' || !story.poll?.length) {
                    return of(story);
                }
                const options = story.poll.map((_, i) => this.fetchPollContent(story.id + i + 1));
                return forkJoin(options).pipe(
                    map((poll) => ({
                        ...story,
                        poll,
                        poll_votes_count: poll.reduce((sum, option) => sum + option.points, 0),
                    }))
                );
            })
        );
    }

    fetchPollContent(id: number): Observable<PollResult> {
        return this.http.get<PollResult>(`${this.baseUrl}/item/${id}`);
    }

    fetchUser(id: string): Observable<User> {
        return this.http.get<User>(`${this.userBaseUrl}/user/${id}.json`);
    }
}
