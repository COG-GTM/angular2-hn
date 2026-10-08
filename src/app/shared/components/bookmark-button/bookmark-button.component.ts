import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { BookmarkableStory, SavedStoriesService } from '../../services/saved-stories.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-bookmark-button',
  templateUrl: './bookmark-button.component.html',
  styleUrls: ['./bookmark-button.component.scss']
})
export class BookmarkButtonComponent implements OnChanges, OnDestroy {
  @Input() story: BookmarkableStory;
  saved = false;
  private sub: Subscription;

  constructor(private savedStoriesService: SavedStoriesService, private toastService: ToastService) {}

  ngOnChanges() {
    this.unsubscribe();
    if (this.story) {
      this.sub = this.savedStoriesService.isSaved$(this.story.id).subscribe(saved => (this.saved = saved));
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  get label(): string {
    return this.saved ? 'Remove from saved' : 'Save story';
  }

  async toggle(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const service = this.savedStoriesService;
    const toast = this.toastService;
    if (this.saved) {
      try {
        const removed = await service.remove(this.story.id);
        if (removed) {
          toast.show('Removed', () => service.restore(removed).catch(() => toast.show(`Couldn't restore story`)));
        }
      } catch {
        toast.show(`Couldn't remove story`);
      }
    } else {
      try {
        const record = await service.save(this.story);
        toast.show('Saved', () => service.remove(record.id).catch(() => toast.show(`Couldn't remove story`)));
      } catch {
        toast.show(`Couldn't save story`);
      }
    }
  }

  private unsubscribe() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
  }
}
