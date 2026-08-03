import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { SavedComponent } from './saved.component';
import { ItemComponent } from '../item/item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SavedStory } from '../../shared/models/saved-story';
import { SavedStoriesService } from '../../shared/services/saved-stories.service';

function buildSavedStory(id: number): SavedStory {
  return {
    id,
    title: 'Story ' + id,
    points: 10,
    user: 'author',
    time: 1175714200,
    time_ago: 18,
    type: 'story',
    url: 'https://example.com/' + id,
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    savedAt: id
  } as SavedStory;
}

class SavedStoriesServiceStub {
  savedStories: SavedStory[] = [];

  isSaved(id: number): boolean {
    return this.savedStories.some(story => story.id === id);
  }

  toggleSaved(story: SavedStory): boolean {
    this.savedStories.splice(this.savedStories.indexOf(story), 1);
    return false;
  }
}

describe('SavedComponent', () => {
  let fixture: ComponentFixture<SavedComponent>;
  let savedStories: SavedStoriesServiceStub;

  function createComponent(stored: SavedStory[]): void {
    savedStories.savedStories = stored;
    fixture = TestBed.createComponent(SavedComponent);
    fixture.detectChanges();
  }

  function renderedItems(): number {
    return fixture.debugElement.queryAll(By.css('item')).length;
  }

  function emptyState() {
    return fixture.debugElement.query(By.css('.empty-state'));
  }

  beforeEach(() => {
    savedStories = new SavedStoriesServiceStub();

    TestBed.configureTestingModule({
      declarations: [SavedComponent, ItemComponent],
      imports: [RouterTestingModule, PipesModule],
      providers: [{ provide: SavedStoriesService, useValue: savedStories }]
    });
  });

  it('renders one item per saved story', () => {
    createComponent([buildSavedStory(1), buildSavedStory(2)]);

    expect(renderedItems()).toBe(2);
    expect(emptyState()).toBeNull();
  });

  it('shows the empty state and no list when nothing is saved', () => {
    createComponent([]);

    expect(renderedItems()).toBe(0);
    expect(emptyState().nativeElement.textContent).toContain('not saved any stories');
  });

  it('drops a story from the list as soon as it is removed from the saved set', () => {
    createComponent([buildSavedStory(1), buildSavedStory(2)]);

    savedStories.savedStories.splice(0, 1);
    fixture.detectChanges();

    expect(renderedItems()).toBe(1);
  });

  it('shows the empty state once the last story is removed', () => {
    createComponent([buildSavedStory(1)]);

    savedStories.savedStories.splice(0, 1);
    fixture.detectChanges();

    expect(renderedItems()).toBe(0);
    expect(emptyState()).not.toBeNull();
  });
});
