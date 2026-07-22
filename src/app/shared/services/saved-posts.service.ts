import { Injectable } from '@angular/core';

import { Story } from '../models/story';

@Injectable({
  providedIn: 'root'
})
export class SavedPostsService {
  private static readonly STORAGE_KEY = 'savedPosts';

  savedPosts: Story[] = localStorage.getItem(SavedPostsService.STORAGE_KEY)
    ? JSON.parse(localStorage.getItem(SavedPostsService.STORAGE_KEY))
    : [];

  getSavedPosts(): Story[] {
    return this.savedPosts;
  }

  isSaved(id: number): boolean {
    return this.savedPosts.some(post => post.id === id);
  }

  toggleSaved(story: Story): void {
    if (this.isSaved(story.id)) {
      this.savedPosts = this.savedPosts.filter(post => post.id !== story.id);
    } else {
      this.savedPosts = [...this.savedPosts, story];
    }
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(SavedPostsService.STORAGE_KEY, JSON.stringify(this.savedPosts));
  }
}
