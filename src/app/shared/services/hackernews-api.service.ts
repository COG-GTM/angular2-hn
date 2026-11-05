import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

export const HN_FEED_API = 'https://api.hackerwebapp.com';
export const HN_FIREBASE_API = 'https://hacker-news.firebaseio.com/v0';

interface ApiPollOption {
  item: string;
  points: number;
}

type ApiStory = Omit<Story, 'poll'> & { poll?: ApiPollOption[]; error?: string };

interface FirebaseUser {
  id: string;
  created: number;
  karma: number;
  about?: string;
}

const TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

export function timeAgo(unixSeconds: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.floor(now / 1000) - unixSeconds);
  for (const [unit, size] of TIME_UNITS) {
    const value = Math.floor(seconds / size);
    if (value >= 1) {
      return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
}

@Injectable({ providedIn: 'root' })
export class HackerNewsAPIService {
  private readonly http = inject(HttpClient);

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return this.http.get<Story[]>(`${HN_FEED_API}/${feedType}`, { params: { page } });
  }

  fetchItemContent(id: number): Observable<Story> {
    return this.http.get<ApiStory>(`${HN_FEED_API}/item/${id}`).pipe(
      map(({ error, poll, ...story }) => {
        if (error) {
          throw new Error(error);
        }
        if (!poll) {
          return story;
        }
        const pollResults: PollResult[] = poll.map(option => ({ content: option.item, points: option.points }));
        return {
          ...story,
          poll: pollResults,
          poll_votes_count: pollResults.reduce((total, option) => total + option.points, 0),
        };
      })
    );
  }

  fetchUser(id: string): Observable<User> {
    return this.http.get<FirebaseUser | null>(`${HN_FIREBASE_API}/user/${encodeURIComponent(id)}.json`).pipe(
      map(user => {
        if (!user) {
          throw new Error(`User ${id} not found`);
        }
        return {
          id: user.id,
          karma: user.karma,
          about: user.about,
          created_time: user.created,
          created: timeAgo(user.created),
        };
      })
    );
  }
}
