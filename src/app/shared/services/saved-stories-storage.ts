import { InjectionToken } from '@angular/core';

import { SavedStory } from '../models/saved-story';
import { Story } from '../models/story';

export interface SavedStoriesStorage {
  getStories(): Promise<SavedStory[]>;
  putStory(story: SavedStory): Promise<void>;
  deleteStory(id: number): Promise<void>;
  getItem(id: number): Promise<Story | undefined>;
  putItem(item: Story): Promise<void>;
  deleteItem(id: number): Promise<void>;
}

export const SAVED_STORIES_STORAGE = new InjectionToken<Promise<SavedStoriesStorage>>('SAVED_STORIES_STORAGE', {
  providedIn: 'root',
  factory: () => openSavedStoriesStorage(),
});

export const SAVED_STORIES_DB_NAME = 'angular2-hn-saved';
const STORIES_STORE = 'stories';
const ITEMS_STORE = 'items';

export class IndexedDbSavedStoriesStorage implements SavedStoriesStorage {
  constructor(private db: IDBDatabase) {}

  getStories(): Promise<SavedStory[]> {
    return this.request<SavedStory[]>(STORIES_STORE, 'readonly', store => store.getAll());
  }

  putStory(story: SavedStory): Promise<void> {
    return this.request(STORIES_STORE, 'readwrite', store => store.put(story)).then(() => undefined);
  }

  deleteStory(id: number): Promise<void> {
    return this.request(STORIES_STORE, 'readwrite', store => store.delete(id)).then(() => undefined);
  }

  getItem(id: number): Promise<Story | undefined> {
    return this.request<Story | undefined>(ITEMS_STORE, 'readonly', store => store.get(id));
  }

  putItem(item: Story): Promise<void> {
    return this.request(ITEMS_STORE, 'readwrite', store => store.put(item)).then(() => undefined);
  }

  deleteItem(id: number): Promise<void> {
    return this.request(ITEMS_STORE, 'readwrite', store => store.delete(id)).then(() => undefined);
  }

  private request<T>(
    storeName: string,
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const tx = this.db.transaction(storeName, mode);
      const req = action(tx.objectStore(storeName));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
}

export class LocalStorageSavedStoriesStorage implements SavedStoriesStorage {
  private readonly storiesKey: string;
  private readonly itemKeyPrefix: string;

  constructor(private storage: Storage, namespace = SAVED_STORIES_DB_NAME) {
    this.storiesKey = `${namespace}:stories`;
    this.itemKeyPrefix = `${namespace}:item:`;
  }

  getStories(): Promise<SavedStory[]> {
    return Promise.resolve(this.readStories());
  }

  putStory(story: SavedStory): Promise<void> {
    return this.run(() => {
      const stories = this.readStories().filter(s => s.id !== story.id);
      stories.push(story);
      this.storage.setItem(this.storiesKey, JSON.stringify(stories));
    });
  }

  deleteStory(id: number): Promise<void> {
    return this.run(() => {
      const stories = this.readStories().filter(s => s.id !== id);
      this.storage.setItem(this.storiesKey, JSON.stringify(stories));
    });
  }

  getItem(id: number): Promise<Story | undefined> {
    return this.run(() => {
      const raw = this.storage.getItem(this.itemKeyPrefix + id);
      return raw ? (JSON.parse(raw) as Story) : undefined;
    });
  }

  putItem(item: Story): Promise<void> {
    return this.run(() => this.storage.setItem(this.itemKeyPrefix + item.id, JSON.stringify(item)));
  }

  deleteItem(id: number): Promise<void> {
    return this.run(() => this.storage.removeItem(this.itemKeyPrefix + id));
  }

  private readStories(): SavedStory[] {
    try {
      const parsed = JSON.parse(this.storage.getItem(this.storiesKey) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private run<T>(fn: () => T): Promise<T> {
    try {
      return Promise.resolve(fn());
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export function openSavedStoriesStorage(
  dbName = SAVED_STORIES_DB_NAME,
  idb: IDBFactory | null = typeof indexedDB !== 'undefined' ? indexedDB : null,
  fallback: Storage = localStorage
): Promise<SavedStoriesStorage> {
  if (!idb) {
    return Promise.resolve(new LocalStorageSavedStoriesStorage(fallback, dbName));
  }
  return openDatabase(idb, dbName).then(
    db => new IndexedDbSavedStoriesStorage(db) as SavedStoriesStorage,
    () => new LocalStorageSavedStoriesStorage(fallback, dbName)
  );
}

function openDatabase(idb: IDBFactory, dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try {
      request = idb.open(dbName, 1);
    } catch (err) {
      reject(err);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORIES_STORE)) {
        db.createObjectStore(STORIES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ITEMS_STORE)) {
        db.createObjectStore(ITEMS_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB open blocked'));
  });
}
