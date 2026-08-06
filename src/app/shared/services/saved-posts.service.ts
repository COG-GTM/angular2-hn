import { Injectable } from '@angular/core';

import { Story } from '../models/story';

const STORAGE_KEY = 'savedPosts';

@Injectable({
  providedIn: 'root'
})
export class SavedPostsService {
  savedPosts: Story[] = localStorage.getItem(STORAGE_KEY) ? JSON.parse(localStorage.getItem(STORAGE_KEY)) : [];

  getSavedPosts(): Story[] {
    return this.savedPosts;
  }

  isSaved(id: number): boolean {
    return this.savedPosts.some(post => post.id === id);
  }

  toggleSaved(story: Story) {
    if (this.isSaved(story.id)) {
      this.removeSaved(story.id);
    } else {
      this.savedPosts = [story, ...this.savedPosts];
      this.persist();
    }
  }

  removeSaved(id: number) {
    this.savedPosts = this.savedPosts.filter(post => post.id !== id);
    this.persist();
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.savedPosts));
  }
}
