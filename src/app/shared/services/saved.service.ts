import { Injectable } from '@angular/core';

import { Story } from '../models/story';

@Injectable({
  providedIn: 'root'
})
export class SavedService {
  savedPosts: Story[] = localStorage.getItem('savedPosts') ? JSON.parse(localStorage.getItem('savedPosts')) : [];

  isSaved(id: number): boolean {
    return this.savedPosts.some(post => post.id === id);
  }

  toggleSaved(story: Story) {
    if (this.isSaved(story.id)) {
      this.removeSaved(story.id);
    } else {
      this.addSaved(story);
    }
  }

  addSaved(story: Story) {
    this.savedPosts.unshift(story);
    this.persist();
  }

  removeSaved(id: number) {
    const index = this.savedPosts.findIndex(post => post.id === id);
    if (index > -1) {
      this.savedPosts.splice(index, 1);
      this.persist();
    }
  }

  private persist() {
    localStorage.setItem('savedPosts', JSON.stringify(this.savedPosts));
  }
}
