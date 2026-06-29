import { Injectable } from '@angular/core';

const STORAGE_KEY = 'savedItems';

@Injectable({
  providedIn: 'root'
})
export class SavedItemsService {
  private savedIds: number[];

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    this.savedIds = stored ? JSON.parse(stored) : [];
  }

  getSavedIds(): number[] {
    return [...this.savedIds];
  }

  isSaved(id: number): boolean {
    return this.savedIds.indexOf(id) !== -1;
  }

  toggle(id: number): boolean {
    if (this.isSaved(id)) {
      this.remove(id);
      return false;
    }
    this.add(id);
    return true;
  }

  add(id: number) {
    if (!this.isSaved(id)) {
      this.savedIds.push(id);
      this.persist();
    }
  }

  remove(id: number) {
    this.savedIds = this.savedIds.filter(savedId => savedId !== id);
    this.persist();
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.savedIds));
  }
}
