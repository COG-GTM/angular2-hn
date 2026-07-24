import { Injectable } from '@angular/core';

import { Story } from '../models/story';

const STORAGE_KEY = 'savedStories';

@Injectable({
  providedIn: 'root'
})
export class BookmarksService {
  savedStories: Story[] = [];

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.savedStories = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        this.savedStories = [];
      }
    }
  }

  isSaved(id: number): boolean {
    return this.savedStories.some(story => story.id === id);
  }

  toggle(story: Story) {
    if (this.isSaved(story.id)) {
      this.savedStories = this.savedStories.filter(saved => saved.id !== story.id);
    } else {
      this.savedStories = [story, ...this.savedStories];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.savedStories));
  }

  getPage(page: number, pageSize: number = 30): Story[] {
    return this.savedStories.slice((page - 1) * pageSize, page * pageSize);
  }
}
