import { Injectable } from '@angular/core';

import { Story } from '../models/story';

@Injectable({
  providedIn: 'root'
})
export class SavedService {
  private storageKey = 'savedStories';
  savedStories: Story[] = [];

  constructor() {
    this.savedStories = this.loadSaved();
  }

  getSaved(): Story[] {
    return this.savedStories;
  }

  isSaved(id: number): boolean {
    return this.savedStories.some(story => story.id === id);
  }

  save(story: Story) {
    if (!this.isSaved(story.id)) {
      this.savedStories = [story, ...this.savedStories];
      this.persist();
    }
  }

  remove(id: number) {
    this.savedStories = this.savedStories.filter(story => story.id !== id);
    this.persist();
  }

  toggle(story: Story) {
    if (this.isSaved(story.id)) {
      this.remove(story.id);
    } else {
      this.save(story);
    }
  }

  private loadSaved(): Story[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : [];
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.savedStories));
  }
}
