import { of } from 'rxjs';

import { Story } from '../models/story';
import { SavedStory } from '../models/saved-story';
import { HackerNewsAPIService } from './hackernews-api.service';
import { SavedStoriesService, toSavedStory } from './saved-stories.service';
import {
  IndexedDbSavedStoriesStorage,
  LocalStorageSavedStoriesStorage,
  SavedStoriesStorage,
  openSavedStoriesStorage,
} from './saved-stories-storage';

function makeStory(id: number, extra: Partial<Story> = {}): Story {
  return {
    id,
    title: `Story ${id}`,
    points: id * 10,
    user: `user${id}`,
    time: 0,
    time_ago: 0,
    type: 'link',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    comments: undefined,
    comments_count: 0,
    poll: undefined,
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...extra,
  } as Story;
}

function makeItem(id: number): Story {
  return makeStory(id, {
    comments: [{ id: id * 100, level: 0, user: 'commenter', time: 0, time_ago: 'now', content: 'hi', deleted: false, comments: [] }],
    comments_count: 1,
  });
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise(resolve => {
    const req = indexedDB.deleteDatabase(name);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
}

let dbCounter = 0;
const uniqueName = () => `saved-stories-spec-${Date.now()}-${dbCounter++}`;

function sharedStorageContract(name: string, create: () => Promise<SavedStoriesStorage>) {
  describe(name, () => {
    let storage: SavedStoriesStorage;

    beforeEach(async () => {
      storage = await create();
    });

    it('starts empty', async () => {
      expect(await storage.getStories()).toEqual([]);
      expect(await storage.getItem(1)).toBeUndefined();
    });

    it('puts, overwrites and deletes stories', async () => {
      const a: SavedStory = { id: 1, title: 'A', url: 'u', by: 'x', score: 1, savedAt: 10 };
      const b: SavedStory = { id: 2, title: 'B', url: 'u', by: 'y', score: 2, savedAt: 20 };
      await storage.putStory(a);
      await storage.putStory(b);
      await storage.putStory({ ...a, score: 5 });
      const stories = await storage.getStories();
      expect(stories.length).toBe(2);
      expect(stories.find(s => s.id === 1).score).toBe(5);

      await storage.deleteStory(1);
      expect((await storage.getStories()).map(s => s.id)).toEqual([2]);
    });

    it('puts, reads and deletes cached items including the comment tree', async () => {
      const item = makeItem(7);
      await storage.putItem(item);
      const cached = await storage.getItem(7);
      expect(cached.comments[0].content).toBe('hi');

      await storage.deleteItem(7);
      expect(await storage.getItem(7)).toBeUndefined();
    });
  });
}

describe('SavedStoriesStorage', () => {
  const dbNames: string[] = [];
  const lsNamespaces: string[] = [];

  afterAll(async () => {
    await Promise.all(dbNames.map(deleteDatabase));
    lsNamespaces.forEach(ns =>
      Object.keys(localStorage)
        .filter(k => k.indexOf(ns) === 0)
        .forEach(k => localStorage.removeItem(k))
    );
  });

  sharedStorageContract('IndexedDbSavedStoriesStorage', () => {
    const name = uniqueName();
    dbNames.push(name);
    return openSavedStoriesStorage(name);
  });

  sharedStorageContract('LocalStorageSavedStoriesStorage', () => {
    const ns = uniqueName();
    lsNamespaces.push(ns);
    return Promise.resolve(new LocalStorageSavedStoriesStorage(localStorage, ns));
  });

  it('uses IndexedDB when it is available', async () => {
    const name = uniqueName();
    dbNames.push(name);
    expect(await openSavedStoriesStorage(name)).toEqual(jasmine.any(IndexedDbSavedStoriesStorage));
  });

  it('falls back to localStorage when IndexedDB is unavailable', async () => {
    expect(await openSavedStoriesStorage(uniqueName(), null)).toEqual(
      jasmine.any(LocalStorageSavedStoriesStorage)
    );
  });

  it('falls back to localStorage when IndexedDB fails to open', async () => {
    const brokenIdb = { open: () => { throw new Error('SecurityError'); } } as any as IDBFactory;
    expect(await openSavedStoriesStorage(uniqueName(), brokenIdb)).toEqual(
      jasmine.any(LocalStorageSavedStoriesStorage)
    );
  });

  it('ignores corrupt localStorage data', async () => {
    const ns = uniqueName();
    lsNamespaces.push(ns);
    localStorage.setItem(`${ns}:stories`, '{not json');
    expect(await new LocalStorageSavedStoriesStorage(localStorage, ns).getStories()).toEqual([]);
  });
});

describe('SavedStoriesService', () => {
  let storage: SavedStoriesStorage;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let namespace: string;
  let now: number;

  const createService = () => new SavedStoriesService(Promise.resolve(storage), api);

  beforeEach(() => {
    namespace = uniqueName();
    storage = new LocalStorageSavedStoriesStorage(localStorage, namespace);
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
    api.fetchItemContent.and.callFake((id: number) => of(makeItem(id)));
    now = 1000;
    spyOn(Date, 'now').and.callFake(() => now++);
  });

  afterEach(() => {
    Object.keys(localStorage)
      .filter(k => k.indexOf(namespace) === 0)
      .forEach(k => localStorage.removeItem(k));
  });

  it('maps a feed story to the persisted shape', () => {
    expect(toSavedStory(makeStory(3), 42)).toEqual({
      id: 3, title: 'Story 3', url: 'https://example.com/3', by: 'user3', score: 30, savedAt: 42,
    });
  });

  it('saves stories most recently saved first and persists them', async () => {
    const service = createService();
    await service.save(makeStory(1));
    await service.save(makeStory(2));

    expect(service.stories.map(s => s.id)).toEqual([2, 1]);
    expect(service.isSaved(1)).toBe(true);
    expect(service.isSaved(3)).toBe(false);

    const reloaded = createService();
    await reloaded.ready;
    expect(reloaded.stories.map(s => s.id)).toEqual([2, 1]);
  });

  it('emits updates to subscribers without a reload', async () => {
    const service = createService();
    const emissions: number[][] = [];
    service.stories$.subscribe(stories => emissions.push(stories.map(s => s.id)));
    await service.save(makeStory(5));
    expect(emissions[emissions.length - 1]).toEqual([5]);
  });

  it('caches the item and comment tree for offline reading when saving from a feed', async () => {
    const service = createService();
    await service.save(makeStory(4));

    expect(api.fetchItemContent).toHaveBeenCalledWith(4);
    const cached = await service.getCachedItem(4);
    expect(cached.comments.length).toBe(1);
  });

  it('caches a full item directly without refetching', async () => {
    const service = createService();
    await service.save(makeItem(6));

    expect(api.fetchItemContent).not.toHaveBeenCalled();
    expect((await service.getCachedItem(6)).comments.length).toBe(1);
  });

  it('removes a story and its cached item, and restores both on undo', async () => {
    const service = createService();
    await service.save(makeItem(1));
    await service.save(makeItem(2));
    const original = service.stories.find(s => s.id === 1);

    const removed = await service.remove(1);
    expect(service.isSaved(1)).toBe(false);
    expect(await storage.getItem(1)).toBeUndefined();
    expect(removed.story).toEqual(original);

    await service.restore(removed);
    expect(service.stories.map(s => s.id)).toEqual([2, 1]);
    expect(service.stories[1].savedAt).toBe(original.savedAt);
    expect((await service.getCachedItem(1)).comments.length).toBe(1);
  });

  it('returns undefined when removing a story that is not saved', async () => {
    expect(await createService().remove(99)).toBeUndefined();
  });

  it('does not expose cached items for stories that are not saved', async () => {
    await storage.putItem(makeItem(8));
    expect(await createService().getCachedItem(8)).toBeUndefined();
  });

  it('refreshes the cached copy and score of a saved story, keeping savedAt', async () => {
    const service = createService();
    await service.save(makeItem(1));
    const savedAt = service.stories[0].savedAt;

    const fresh = makeItem(1);
    fresh.points = 999;
    fresh.comments.push({ id: 2, level: 0, user: 'b', time: 0, time_ago: 'now', content: 'new', deleted: false, comments: [] });
    await service.refresh(fresh);

    expect(service.stories[0].score).toBe(999);
    expect(service.stories[0].savedAt).toBe(savedAt);
    expect((await service.getCachedItem(1)).comments.length).toBe(2);
  });

  it('ignores refreshes for stories that are not saved', async () => {
    const service = createService();
    await service.refresh(makeItem(3));
    expect(service.stories).toEqual([]);
    expect(await storage.getItem(3)).toBeUndefined();
  });

  it('starts empty when storage fails to open', async () => {
    const service = new SavedStoriesService(Promise.reject(new Error('nope')), api);
    await service.ready;
    expect(service.stories).toEqual([]);
  });
});
