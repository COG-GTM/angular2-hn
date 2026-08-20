import { Injectable } from '@angular/core';

import { Story } from '../models/story';

@Injectable({
  providedIn: 'root'
})
export class SavedPostsService {
  savedPosts: Story[] = localStorage.getItem("savedPosts") ? JSON.parse(localStorage.getItem("savedPosts")) : [];
  notes: { [id: number]: string } = localStorage.getItem("savedPostNotes") ? JSON.parse(localStorage.getItem("savedPostNotes")) : {};

  isSaved(id: number): boolean {
    return this.savedPosts.some(post => post.id === id);
  }

  toggleSaved(story: Story) {
    if (this.isSaved(story.id)) {
      this.removeSaved(story.id);
    } else {
      this.savedPosts = [story, ...this.savedPosts];
      localStorage.setItem("savedPosts", JSON.stringify(this.savedPosts));
    }
  }

  removeSaved(id: number) {
    this.savedPosts = this.savedPosts.filter(post => post.id !== id);
    localStorage.setItem("savedPosts", JSON.stringify(this.savedPosts));
    this.removeNote(id);
  }

  getNote(id: number): string {
    return this.notes[id] ? this.notes[id] : '';
  }

  setNote(id: number, note: string) {
    this.notes[id] = note;
    localStorage.setItem("savedPostNotes", JSON.stringify(this.notes));
  }

  removeNote(id: number) {
    delete this.notes[id];
    localStorage.setItem("savedPostNotes", JSON.stringify(this.notes));
  }
}
