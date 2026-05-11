import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

@Injectable()
export class MockHackerNewsAPIService {

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    const stories: Story[] = [];
    for (let i = 1; i <= 10; i++) {
      stories.push({
        id: i + (page - 1) * 10,
        title: `Mock ${feedType} story #${i + (page - 1) * 10}`,
        points: Math.floor(Math.random() * 500) + 10,
        user: `mockuser${i}`,
        time: Math.floor(Date.now() / 1000) - i * 3600,
        time_ago: `${i} hours ago`,
        type: 'story',
        url: `https://example.com/article-${i}`,
        domain: 'example.com',
        comments: [],
        comments_count: Math.floor(Math.random() * 100),
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
      } as unknown as Story);
    }
    return of(stories);
  }

  fetchItemContent(id: number): Observable<Story> {
    return of({
      id: id,
      title: `Mock story #${id}`,
      points: 142,
      user: 'mockuser1',
      time: Math.floor(Date.now() / 1000) - 3600,
      time_ago: '1 hour ago',
      type: 'story',
      url: `https://example.com/article-${id}`,
      domain: 'example.com',
      comments: [
        {
          id: 1001,
          level: 0,
          user: 'commenter1',
          time: Math.floor(Date.now() / 1000) - 1800,
          time_ago: '30 minutes ago',
          content: 'This is a mock comment for testing offline mode.',
          deleted: false,
          comments: [
            {
              id: 1002,
              level: 1,
              user: 'commenter2',
              time: Math.floor(Date.now() / 1000) - 900,
              time_ago: '15 minutes ago',
              content: 'This is a nested reply.',
              deleted: false,
              comments: [],
            }
          ],
        }
      ],
      comments_count: 2,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false,
    } as unknown as Story);
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return of({ points: 42, content: 'Mock poll option' } as PollResult);
  }

  fetchUser(id: string): Observable<User> {
    return of({
      id: id,
      crated_time: Math.floor(Date.now() / 1000) - 86400 * 365,
      created: '1 year ago',
      karma: 1234,
      avg: 10,
      about: `This is the mock profile for user ${id}.`,
    } as User);
  }
}
