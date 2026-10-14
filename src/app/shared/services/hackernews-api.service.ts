import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import fetch from 'unfetch';
import { EMPTY } from 'rxjs';
import { expand, map, reduce } from 'rxjs/operators';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const SECONDS_PER_WEEK = 7 * 24 * 60 * 60;
const WEEKLY_SUMMARY_MAX_PAGES = 10;

interface FeedPage {
  page: number;
  stories: Story[];
  seenIds: Set<number>;
}

// wrap fetch in observable so we can keep it chill
@Injectable()
export class HackerNewsAPIService {
  baseUrl: string;

  constructor() {
    this.baseUrl = 'https://node-hnapi.herokuapp.com';
  }

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return lazyFetch(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  fetchWeeklySummary(): Observable<Story[]> {
    const cutoff = Math.floor(Date.now() / 1000) - SECONDS_PER_WEEK;
    const fetchPage = (page: number, seenIds: Set<number>) =>
      this.fetchFeed('news', page).pipe(map((stories: Story[]): FeedPage => {
        const newStories = (stories || []).filter(story => !seenIds.has(story.id));
        const nextSeenIds = new Set(seenIds);
        newStories.forEach(story => nextSeenIds.add(story.id));
        return { page, stories: newStories, seenIds: nextSeenIds };
      }));

    return fetchPage(1, new Set<number>()).pipe(
      expand(({ page, stories, seenIds }) => {
        const reachedOlderStory = stories.some(story => story.time < cutoff);
        return !reachedOlderStory && page < WEEKLY_SUMMARY_MAX_PAGES
          ? fetchPage(page + 1, seenIds)
          : EMPTY;
      }),
      reduce((all: Story[], { stories }) => all.concat(stories), []),
      map(stories => stories
        .filter(story => story.time >= cutoff)
        .sort((a, b) => (b.points || 0) - (a.points || 0)))
    );
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

