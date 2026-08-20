import { Component } from '@angular/core';

import { SavedPostsService } from '../../shared/services/saved-posts.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent {
  editingId: number = null;
  draftNote = '';

  constructor(private _savedPostsService: SavedPostsService) { }

  get items(): Story[] {
    return this._savedPostsService.savedPosts;
  }

  getNote(id: number): string {
    return this._savedPostsService.getNote(id);
  }

  startEditing(id: number) {
    this.editingId = id;
    this.draftNote = this.getNote(id);
  }

  cancelEditing() {
    this.editingId = null;
    this.draftNote = '';
  }

  saveNote(id: number) {
    const note = this.draftNote.trim();
    if (note) {
      this._savedPostsService.setNote(id, note);
    } else {
      this._savedPostsService.removeNote(id);
    }
    this.cancelEditing();
  }

  deleteNote(id: number) {
    this._savedPostsService.removeNote(id);
    this.cancelEditing();
  }
}
