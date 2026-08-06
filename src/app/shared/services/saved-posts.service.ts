import { Injectable } from '@angular/core';

import { Story } from '../models/story';

@Injectable({
  providedIn: 'root'
})
export class SavedPostsService {
  private static readonly STORAGE_KEY = 'savedPosts';

  savedPosts: Story[] = SavedPostsService.read();

  private static read(): Story[] {
    try {
      const stored = JSON.parse(localStorage.getItem(SavedPostsService.STORAGE_KEY));
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  getSavedPosts(): Story[] {
    return this.savedPosts;
  }

  isSaved(id: number): boolean {
    return this.savedPosts.some(post => post.id === id);
  }

  toggleSaved(story: Story): void {
    const index = this.savedPosts.findIndex(post => post.id === story.id);
    if (index > -1) {
      this.savedPosts.splice(index, 1);
    } else {
      this.savedPosts.push(story);
    }
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(SavedPostsService.STORAGE_KEY, JSON.stringify(this.savedPosts));
  }
}
