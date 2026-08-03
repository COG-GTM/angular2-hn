import { TestBed } from '@angular/core/testing';

import { SavedStoriesService } from './saved-stories.service';
import { Comment } from '../models/comment';
import { PollResult } from '../models/poll-result';
import { SavedStory } from '../models/saved-story';
import { Story } from '../models/story';

const STORAGE_KEY = 'savedStories';

function buildStory(id: number, overrides: Partial<Story> = {}): Story {
  return {
    id,
    title: 'Story ' + id,
    points: 10,
    user: 'author',
    time: 1175714200,
    time_ago: 18,
    type: 'story',
    url: 'https://example.com/' + id,
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides
  } as Story;
}

function createService(): SavedStoriesService {
  TestBed.configureTestingModule({});
  return TestBed.inject(SavedStoriesService);
}

function readStorage(): SavedStory[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

describe('SavedStoriesService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('hydration', () => {
    it('starts empty when nothing is stored', () => {
      const service = createService();

      expect(service.savedStories).toEqual([]);
    });

    it('restores stories from storage in their stored order', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { ...buildStory(2), savedAt: 200 },
        { ...buildStory(1), savedAt: 100 }
      ]));

      const service = createService();

      expect(service.savedStories.map(story => story.id)).toEqual([2, 1]);
      expect(service.savedStories[0].savedAt).toBe(200);
    });

    it('falls back to an empty set when the stored value is not valid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not json');
      let service: SavedStoriesService;

      expect(() => service = createService()).not.toThrow();
      expect(service.savedStories).toEqual([]);
    });

    it('falls back to an empty set when the stored value is not an array', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 1 }));

      expect(createService().savedStories).toEqual([]);
    });

    it('drops stored entries without a numeric id and defaults missing fields', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { title: 'No id' },
        { id: 7, title: 'Partial' }
      ]));

      const service = createService();

      expect(service.savedStories.length).toBe(1);
      expect(service.savedStories[0].id).toBe(7);
      expect(service.savedStories[0].url).toBe('');
      expect(service.savedStories[0].savedAt).toBe(0);
      expect(service.savedStories[0].comments).toEqual([]);
    });
  });

  describe('save', () => {
    it('adds the story and persists it', () => {
      const service = createService();

      service.save(buildStory(1));

      expect(service.isSaved(1)).toBe(true);
      expect(readStorage().map(story => story.id)).toEqual([1]);
    });

    it('keeps the newest saved story first', () => {
      const service = createService();

      service.save(buildStory(1));
      service.save(buildStory(2));

      expect(service.savedStories.map(story => story.id)).toEqual([2, 1]);
    });

    it('stores each story at most once and leaves the original savedAt untouched', () => {
      const service = createService();

      service.save(buildStory(1));
      const savedAt = service.savedStories[0].savedAt;
      service.save(buildStory(1));

      expect(service.savedStories.length).toBe(1);
      expect(service.savedStories[0].savedAt).toBe(savedAt);
    });

    it('omits comments and poll results from the persisted payload', () => {
      const service = createService();

      service.save(buildStory(1, {
        comments: [{ id: 99, content: 'A comment' } as Comment],
        poll: [{ points: 5, content: 'An option' } as PollResult]
      }));

      const persisted = readStorage()[0];
      expect(persisted.comments).toBeUndefined();
      expect(persisted.poll).toBeUndefined();
      expect(persisted.title).toBe('Story 1');
    });
  });

  describe('remove', () => {
    it('removes the story and persists the smaller set', () => {
      const service = createService();
      service.save(buildStory(1));
      service.save(buildStory(2));

      service.remove(1);

      expect(service.isSaved(1)).toBe(false);
      expect(readStorage().map(story => story.id)).toEqual([2]);
    });

    it('ignores a story that is not saved', () => {
      const service = createService();
      service.save(buildStory(1));

      service.remove(42);

      expect(service.savedStories.length).toBe(1);
    });
  });

  describe('toggleSaved', () => {
    it('saves an unsaved story and reports the new state', () => {
      const service = createService();

      expect(service.toggleSaved(buildStory(1))).toBe(true);
      expect(service.isSaved(1)).toBe(true);
    });

    it('removes a saved story and reports the new state', () => {
      const service = createService();
      service.toggleSaved(buildStory(1));

      expect(service.toggleSaved(buildStory(1))).toBe(false);
      expect(service.isSaved(1)).toBe(false);
      expect(readStorage()).toEqual([]);
    });
  });

  it('keeps the same array reference across mutations so template bindings stay live', () => {
    const service = createService();
    const reference = service.savedStories;

    service.save(buildStory(1));
    service.remove(1);

    expect(service.savedStories).toBe(reference);
  });

  it('survives storage writes that throw', () => {
    const service = createService();
    spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');

    expect(() => service.save(buildStory(1))).not.toThrow();
    expect(service.isSaved(1)).toBe(true);
  });
});
