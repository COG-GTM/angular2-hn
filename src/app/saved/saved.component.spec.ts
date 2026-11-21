import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SavedComponent } from './saved.component';
import { SavedStory } from '../shared/models/saved-story';
import { SavedStoriesService } from '../shared/services/saved-stories.service';
import { SettingsService } from '../shared/services/settings.service';

function makeSaved(id: number, extra: Partial<SavedStory> = {}): SavedStory {
  return {
    id,
    title: `Story ${id}`,
    url: `https://www.example.com/${id}`,
    by: `user${id}`,
    score: id * 10,
    savedAt: id,
    ...extra,
  };
}

describe('SavedComponent', () => {
  let fixture: ComponentFixture<SavedComponent>;
  let component: SavedComponent;
  let stories$: BehaviorSubject<SavedStory[]>;
  let loaded$: BehaviorSubject<boolean>;
  let settings: any;

  const el = (): HTMLElement => fixture.nativeElement;
  const titles = () => Array.from(el().querySelectorAll('.saved-story .title')).map(a => a.textContent.trim());

  beforeEach(() => {
    stories$ = new BehaviorSubject<SavedStory[]>([]);
    loaded$ = new BehaviorSubject<boolean>(false);
    settings = { listSpacing: 4, titleFontSize: 16, openLinkInNewTab: false };
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [SavedComponent],
      providers: [
        { provide: SavedStoriesService, useValue: { stories$, loaded$ } },
        { provide: SettingsService, useValue: { settings } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(SavedComponent);
    component = fixture.componentInstance;
  });

  it('scrolls to the top on init', () => {
    fixture.detectChanges();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('shows the loader until saved stories have loaded', () => {
    fixture.detectChanges();
    expect(el().querySelector('app-loader')).not.toBeNull();
    expect(el().querySelector('.empty-state')).toBeNull();

    loaded$.next(true);
    fixture.detectChanges();
    expect(el().querySelector('app-loader')).toBeNull();
  });

  it('shows the empty state when nothing is saved', () => {
    loaded$.next(true);
    fixture.detectChanges();
    expect(el().querySelector('.empty-state h2').textContent).toContain('No saved stories yet');
    expect(el().querySelector('.saved-list')).toBeNull();
  });

  it('lists saved stories in the order the service emits them, with a bookmark button each', () => {
    loaded$.next(true);
    stories$.next([makeSaved(2), makeSaved(1)]);
    fixture.detectChanges();

    expect(titles()).toEqual(['Story 2', 'Story 1']);
    expect(el().querySelectorAll('app-bookmark-button').length).toBe(2);
    expect(el().querySelector('.empty-state')).toBeNull();
  });

  it('updates the list when a story is removed and falls back to the empty state', () => {
    loaded$.next(true);
    stories$.next([makeSaved(2), makeSaved(1)]);
    fixture.detectChanges();

    stories$.next([makeSaved(1)]);
    fixture.detectChanges();
    expect(titles()).toEqual(['Story 1']);

    stories$.next([]);
    fixture.detectChanges();
    expect(el().querySelector('.empty-state')).not.toBeNull();
  });

  it('links external stories to their url and shows the domain without www', () => {
    loaded$.next(true);
    stories$.next([makeSaved(1)]);
    fixture.detectChanges();

    const title = el().querySelector('.saved-story a.title') as HTMLAnchorElement;
    expect(title.getAttribute('href')).toBe('https://www.example.com/1');
    expect(title.getAttribute('target')).toBeNull();
    expect(el().querySelector('.domain').textContent).toContain('(example.com)');
  });

  it('opens external links in a new tab when the setting is on', () => {
    settings.openLinkInNewTab = true;
    loaded$.next(true);
    stories$.next([makeSaved(1)]);
    fixture.detectChanges();

    const title = el().querySelector('.saved-story a.title') as HTMLAnchorElement;
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
  });

  it('links self posts to the item page and hides the domain', () => {
    loaded$.next(true);
    stories$.next([makeSaved(3, { url: 'item?id=3' })]);
    fixture.detectChanges();

    const title = el().querySelector('.saved-story a.title') as HTMLAnchorElement;
    expect(title.getAttribute('href')).toBe('/item/3');
    expect(el().querySelector('.domain')).toBeNull();
  });

  it('shows the author and score only when the story has an author', () => {
    loaded$.next(true);
    stories$.next([makeSaved(1), makeSaved(2, { by: undefined })]);
    fixture.detectChanges();

    const subtexts = Array.from(el().querySelectorAll('.subtext')).map(s => s.textContent);
    expect(subtexts[0]).toContain('10 points by');
    expect(subtexts[1]).not.toContain('points by');
    expect(el().querySelectorAll('.comments-link')[1].getAttribute('href')).toBe('/item/2');
  });

  it('applies the list spacing and title font size settings', () => {
    loaded$.next(true);
    stories$.next([makeSaved(1)]);
    fixture.detectChanges();

    expect((el().querySelector('.saved-story') as HTMLElement).style.marginBottom).toBe('4px');
    expect((el().querySelector('.saved-story .title') as HTMLElement).style.fontSize).toBe('16px');
  });

  describe('helpers', () => {
    it('hasUrl accepts only http(s) urls', () => {
      expect(component.hasUrl(makeSaved(1))).toBe(true);
      expect(component.hasUrl(makeSaved(1, { url: 'item?id=1' }))).toBe(false);
      expect(component.hasUrl(makeSaved(1, { url: undefined }))).toBe(false);
    });

    it('domain returns an empty string for missing or malformed urls', () => {
      expect(component.domain(makeSaved(1, { url: 'https://news.ycombinator.com/x' }))).toBe('news.ycombinator.com');
      expect(component.domain(makeSaved(1, { url: 'item?id=1' }))).toBe('');
      expect(component.domain(makeSaved(1, { url: 'http://' }))).toBe('');
    });

    it('tracks rows by story id', () => {
      expect(component.trackById(0, makeSaved(42))).toBe(42);
    });
  });
});
