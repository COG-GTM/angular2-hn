import { Injectable } from '@angular/core';

import { SavedPost } from '../models/saved-post';
import { Story } from '../models/story';

@Injectable({
  providedIn: 'root'
})
export class SavedPostsService {
  savedPosts: SavedPost[] = localStorage.getItem('savedPosts')
    ? JSON.parse(localStorage.getItem('savedPosts'))
    : [];

  constructor() { }

  isSaved(id: number): boolean {
    return this.savedPosts.some(post => post.id === id);
  }

  toggle(story: Story) {
    if (this.isSaved(story.id)) {
      this.remove(story.id);
    } else {
      this.add(story);
    }
  }

  add(story: Story) {
    if (this.isSaved(story.id)) {
      return;
    }
    this.savedPosts = [{ ...story, savedAt: Date.now() }, ...this.savedPosts];
    this.persist();
  }

  remove(id: number) {
    this.savedPosts = this.savedPosts.filter(post => post.id !== id);
    this.persist();
  }

  private persist() {
    localStorage.setItem('savedPosts', JSON.stringify(this.savedPosts));
  }
}
