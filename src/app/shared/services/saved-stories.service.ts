import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RemovedStory, SavedStory } from '../models/saved-story';
import { Story } from '../models/story';
import { HackerNewsAPIService } from './hackernews-api.service';
import { SAVED_STORIES_STORAGE, SavedStoriesStorage } from './saved-stories-storage';

export type BookmarkableStory = Story | SavedStory;

@Injectable({
  providedIn: 'root'
})
export class SavedStoriesService {
  readonly ready: Promise<void>;
  private readonly storiesSubject = new BehaviorSubject<SavedStory[]>([]);
  private readonly loadedSubject = new BehaviorSubject<boolean>(false);
  private readonly storage: Promise<SavedStoriesStorage>;

  constructor(
    @Inject(SAVED_STORIES_STORAGE) storage: Promise<SavedStoriesStorage>,
    private hackerNewsAPIService: HackerNewsAPIService
  ) {
    this.storage = storage;
    this.ready = storage
      .then(s => s.getStories())
      .then(stories => this.emit(stories), () => this.emit([]))
      .then(() => this.loadedSubject.next(true));
    this.ready.then(() => this.cacheMissingItems());
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.cacheMissingItems());
    }
  }

  get stories$(): Observable<SavedStory[]> {
    return this.storiesSubject.asObservable();
  }

  get loaded$(): Observable<boolean> {
    return this.loadedSubject.asObservable();
  }

  get stories(): SavedStory[] {
    return this.storiesSubject.value;
  }

  isSaved(id: number): boolean {
    return this.stories.some(s => s.id === id);
  }

  isSaved$(id: number): Observable<boolean> {
    return this.stories$.pipe(map(stories => stories.some(s => s.id === id)));
  }

  async save(story: BookmarkableStory): Promise<SavedStory> {
    await this.ready;
    const record = toSavedStory(story, Date.now());
    this.emit([record, ...this.stories.filter(s => s.id !== record.id)]);
    try {
      const storage = await this.storage;
      await storage.putStory(record);
    } catch (e) {
      this.emit(this.stories.filter(s => s.id !== record.id));
      throw e;
    }
    if (isFullItem(story)) {
      await this.cacheItem(story);
    } else {
      this.fetchAndCache(record.id);
    }
    return record;
  }

  async remove(id: number): Promise<RemovedStory | undefined> {
    await this.ready;
    const story = this.stories.find(s => s.id === id);
    if (!story) {
      return undefined;
    }
    this.emit(this.stories.filter(s => s.id !== id));
    let item: Story;
    try {
      const storage = await this.storage;
      item = await storage.getItem(id).catch((): Story => undefined);
      await storage.deleteStory(id);
    } catch (e) {
      this.emit([story, ...this.stories.filter(s => s.id !== id)]);
      throw e;
    }
    // A leftover item is harmless: getCachedItem only serves items whose story is still saved.
    await this.storage.then(s => s.deleteItem(id)).catch(() => {});
    return { story, item };
  }

  async restore(removed: RemovedStory): Promise<void> {
    await this.ready;
    const id = removed.story.id;
    this.emit([removed.story, ...this.stories.filter(s => s.id !== id)]);
    try {
      const storage = await this.storage;
      await storage.putStory(removed.story);
    } catch (e) {
      this.emit(this.stories.filter(s => s.id !== id));
      throw e;
    }
    if (removed.item) {
      await this.cacheItem(removed.item);
    } else {
      this.fetchAndCache(removed.story.id);
    }
  }

  async getCachedItem(id: number): Promise<Story | undefined> {
    await this.ready;
    if (!this.isSaved(id)) {
      return undefined;
    }
    const storage = await this.storage;
    return storage.getItem(id);
  }

  /** Refreshes the offline copy (and the saved title/score) of a saved story with freshly fetched data. */
  async refresh(item: Story): Promise<void> {
    await this.ready;
    const existing = this.stories.find(s => s.id === item.id);
    if (!existing) {
      return;
    }
    const updated = { ...toSavedStory(item, existing.savedAt) };
    this.emit(this.stories.map(s => (s.id === item.id ? updated : s)));
    const storage = await this.storage;
    await storage.putStory(updated);
    await storage.putItem(item);
  }

  /** Retries offline caching for saved stories whose comment tree never got stored (e.g. saved just before going offline). */
  async cacheMissingItems(): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return;
    }
    try {
      const storage = await this.storage;
      for (const story of this.stories) {
        if (!(await storage.getItem(story.id))) {
          this.fetchAndCache(story.id);
        }
      }
    } catch {
      // Storage unavailable; nothing to retry.
    }
  }

  private fetchAndCache(id: number) {
    this.hackerNewsAPIService.fetchItemContent(id).subscribe(
      item => {
        if (item && this.isSaved(id)) {
          this.cacheItem(item);
        }
      },
      () => {}
    );
  }

  private cacheItem(item: Story): Promise<void> {
    return this.storage.then(s => s.putItem(item)).catch(() => {});
  }

  private emit(stories: SavedStory[]) {
    this.storiesSubject.next([...stories].sort((a, b) => b.savedAt - a.savedAt));
  }
}

export function toSavedStory(story: BookmarkableStory, savedAt: number): SavedStory {
  if (isSavedStory(story)) {
    return { ...story, savedAt };
  }
  return {
    id: story.id,
    title: story.title,
    url: story.url,
    by: story.user,
    score: story.points,
    savedAt,
  };
}

function isSavedStory(story: BookmarkableStory): story is SavedStory {
  return (story as SavedStory).savedAt !== undefined;
}

function isFullItem(story: BookmarkableStory): story is Story {
  return !isSavedStory(story) && Array.isArray((story as Story).comments);
}
