import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';
import { MOCK_FEEDS, MOCK_ITEMS, MOCK_POLL_OPTIONS, MOCK_USERS } from './mock-data';

@Injectable()
export class HackerNewsAPIService {
  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return of(page === 1 ? (MOCK_FEEDS[feedType] || []) : []);
  }

  fetchItemContent(id: number): Observable<Story> {
    const item = MOCK_ITEMS[id];
    if (!item) {
      return throwError(new Error('Item not found'));
    }

    const story = JSON.parse(JSON.stringify(item)) as Story;
    return of(story).pipe(map((itemStory: Story) => {
      if (itemStory.type === 'poll') {
        const numberOfPollOptions = itemStory.poll.length;
        itemStory.poll_votes_count = 0;
        for (let i = 1; i <= numberOfPollOptions; i++) {
          this.fetchPollContent(itemStory.id + i).subscribe(pollResults => {
            itemStory.poll[i - 1] = pollResults;
            itemStory.poll_votes_count += pollResults.points;
          });
        }
      }
      return itemStory;
    }));
  }

  fetchPollContent(id: number): Observable<PollResult> {
    const pollOption = MOCK_POLL_OPTIONS[id];
    return pollOption ? of(pollOption) : throwError(new Error('Poll option not found'));
  }

  fetchUser(id: string): Observable<User> {
    return of(MOCK_USERS[id] || {
      id,
      crated_time: 0,
      created: 'a while ago',
      karma: 1,
      avg: 0,
      about: ''
    });
  }
}
