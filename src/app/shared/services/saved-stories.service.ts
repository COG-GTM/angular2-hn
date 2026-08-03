import { Injectable } from '@angular/core';

import { SavedStory } from '../models/saved-story';
import { Story } from '../models/story';

const STORAGE_KEY = 'savedStories';

@Injectable({
  providedIn: 'root'
})
export class SavedStoriesService {
  savedStories: SavedStory[] = this.readSavedStories();

  isSaved(id: number): boolean {
    return this.indexOf(id) !== -1;
  }

  save(story: Story): void {
    if (!story || this.isSaved(story.id)) {
      return;
    }
    this.savedStories.unshift({ ...story, savedAt: Date.now() });
    this.persist();
  }

  remove(id: number): void {
    const index = this.indexOf(id);
    if (index === -1) {
      return;
    }
    this.savedStories.splice(index, 1);
    this.persist();
  }

  toggleSaved(story: Story): boolean {
    if (this.isSaved(story.id)) {
      this.remove(story.id);
      return false;
    }
    this.save(story);
    return true;
  }

  private indexOf(id: number): number {
    return this.savedStories.findIndex(story => story.id === id);
  }

  private readSavedStories(): SavedStory[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return [];
    }
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map(entry => this.normalize(entry as Partial<SavedStory>))
      .filter((story): story is SavedStory => story !== null);
  }

  // Stored entries can be hand-edited or written by an older version, so every field the view
  // depends on is defaulted here rather than trusted.
  private normalize(entry: Partial<SavedStory>): SavedStory {
    if (!entry || typeof entry.id !== 'number') {
      return null;
    }
    return {
      ...(entry as SavedStory),
      url: typeof entry.url === 'string' ? entry.url : '',
      comments: [],
      poll: [],
      savedAt: typeof entry.savedAt === 'number' ? entry.savedAt : 0
    };
  }

  // Comment trees and poll results are dropped: they are never rendered from a saved entry and
  // would exhaust the storage quota after a handful of saves.
  private persist(): void {
    const payload = this.savedStories.map(story => {
      const { comments, poll, ...rest } = story;
      return rest;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      // Storage can be unavailable or full; the in-memory set stays authoritative for the session.
    }
  }
}
