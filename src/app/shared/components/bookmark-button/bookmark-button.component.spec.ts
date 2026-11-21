import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { BookmarkButtonComponent } from './bookmark-button.component';
import { RemovedStory, SavedStory } from '../../models/saved-story';
import { SavedStoriesService } from '../../services/saved-stories.service';
import { ToastService } from '../../services/toast.service';

const story: SavedStory = { id: 1, title: 'Story 1', url: 'https://example.com/1', by: 'u', score: 1, savedAt: 1 };

describe('BookmarkButtonComponent', () => {
  let fixture: ComponentFixture<BookmarkButtonComponent>;
  let component: BookmarkButtonComponent;
  let savedIds: BehaviorSubject<number[]>;
  let service: jasmine.SpyObj<SavedStoriesService>;
  let toast: jasmine.SpyObj<ToastService>;

  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');
  const click = async () => {
    button().click();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const lastUndo = (): (() => void) => toast.show.calls.mostRecent().args[1];

  beforeEach(() => {
    savedIds = new BehaviorSubject<number[]>([]);
    service = jasmine.createSpyObj<SavedStoriesService>('SavedStoriesService', ['isSaved$', 'save', 'remove', 'restore']);
    service.isSaved$.and.callFake((id: number) => savedIds.pipe(map(ids => ids.indexOf(id) !== -1)));
    service.save.and.callFake(async s => {
      savedIds.next([...savedIds.value, s.id]);
      return story;
    });
    service.remove.and.callFake(async id => {
      savedIds.next(savedIds.value.filter(i => i !== id));
      return { story } as RemovedStory;
    });
    service.restore.and.returnValue(Promise.resolve());
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    TestBed.configureTestingModule({
      declarations: [BookmarkButtonComponent],
      providers: [
        { provide: SavedStoriesService, useValue: service },
        { provide: ToastService, useValue: toast },
      ],
    });
    fixture = TestBed.createComponent(BookmarkButtonComponent);
    component = fixture.componentInstance;
  });

  function render(input = story) {
    component.story = input;
    component.ngOnChanges();
    fixture.detectChanges();
  }

  it('renders an unsaved, accessible toggle for a story that is not saved', () => {
    render();
    expect(button().getAttribute('aria-pressed')).toBe('false');
    expect(button().getAttribute('aria-label')).toBe('Save story');
    expect(button().classList).not.toContain('saved');
  });

  it('renders the saved state for a story that is already saved', () => {
    savedIds.next([1]);
    render();
    expect(button().getAttribute('aria-pressed')).toBe('true');
    expect(button().getAttribute('aria-label')).toBe('Remove from saved');
    expect(button().classList).toContain('saved');
  });

  it('follows changes made elsewhere (e.g. on the Saved tab)', () => {
    render();
    savedIds.next([1]);
    fixture.detectChanges();
    expect(component.saved).toBe(true);
    savedIds.next([]);
    fixture.detectChanges();
    expect(component.saved).toBe(false);
  });

  it('saves on click, shows a "Saved" toast, and undo removes it again', async () => {
    render();
    await click();

    expect(service.save).toHaveBeenCalledWith(story);
    expect(button().getAttribute('aria-pressed')).toBe('true');
    expect(toast.show).toHaveBeenCalledWith('Saved', jasmine.any(Function));

    lastUndo()();
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('removes on click when saved, shows a "Removed" toast, and undo restores it', async () => {
    savedIds.next([1]);
    render();
    await click();

    expect(service.remove).toHaveBeenCalledWith(1);
    expect(button().getAttribute('aria-pressed')).toBe('false');
    expect(toast.show).toHaveBeenCalledWith('Removed', jasmine.any(Function));

    lastUndo()();
    expect(service.restore).toHaveBeenCalledWith({ story } as RemovedStory);
  });

  it('does not show a toast when the story was already gone', async () => {
    savedIds.next([1]);
    service.remove.and.returnValue(Promise.resolve(undefined));
    render();
    await click();
    expect(toast.show).not.toHaveBeenCalled();
  });

  it('reports failures to save or remove', async () => {
    service.save.and.returnValue(Promise.reject(new Error('quota')));
    render();
    await click();
    expect(toast.show).toHaveBeenCalledWith(`Couldn't save story`);

    savedIds.next([1]);
    fixture.detectChanges();
    service.remove.and.returnValue(Promise.reject(new Error('locked')));
    await click();
    expect(toast.show).toHaveBeenCalledWith(`Couldn't remove story`);
  });

  it('stops the click from following the surrounding link', () => {
    render();
    const event = jasmine.createSpyObj<Event>('Event', ['preventDefault', 'stopPropagation']);
    component.toggle(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('resubscribes when the story input changes and unsubscribes on destroy', () => {
    savedIds.next([2]);
    render();
    expect(component.saved).toBe(false);

    render({ ...story, id: 2 });
    expect(service.isSaved$).toHaveBeenCalledWith(2);
    expect(component.saved).toBe(true);

    fixture.destroy();
    savedIds.next([]);
    expect(component.saved).toBe(true);
  });
});
