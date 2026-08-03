import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';
import { SavedStoriesService } from '../../shared/services/saved-stories.service';

class SavedStoriesServiceStub {
  saved = false;
  toggled: Story[] = [];

  isSaved(id: number): boolean {
    return this.saved;
  }

  toggleSaved(story: Story): boolean {
    this.toggled.push(story);
    this.saved = !this.saved;
    return this.saved;
  }
}

function buildStory(): Story {
  return {
    id: 1,
    title: 'A story',
    points: 10,
    user: 'author',
    time: 1175714200,
    time_ago: 18,
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false
  } as Story;
}

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let savedStories: SavedStoriesServiceStub;

  beforeEach(() => {
    savedStories = new SavedStoriesServiceStub();

    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      imports: [RouterTestingModule, PipesModule],
      providers: [{ provide: SavedStoriesService, useValue: savedStories }]
    });

    fixture = TestBed.createComponent(ItemComponent);
    fixture.componentInstance.item = buildStory();
    fixture.detectChanges();
  });

  function saveToggle(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('.save-toggle')).nativeElement;
  }

  it('renders a save toggle for the story', () => {
    expect(saveToggle()).toBeTruthy();
  });

  it('reports the unsaved state to assistive technology', () => {
    expect(saveToggle().getAttribute('aria-pressed')).toBe('false');
    expect(saveToggle().getAttribute('aria-label')).toBe('Save story');
  });

  it('toggles the story through the service when activated', () => {
    saveToggle().click();

    expect(savedStories.toggled).toEqual([fixture.componentInstance.item]);
  });

  it('reports the saved state after being activated', () => {
    saveToggle().click();
    fixture.detectChanges();

    expect(saveToggle().getAttribute('aria-pressed')).toBe('true');
    expect(saveToggle().getAttribute('aria-label')).toBe('Remove from saved');
  });

  it('marks the toggle as saved when the story is already saved', () => {
    savedStories.saved = true;
    fixture.detectChanges();

    expect(saveToggle().classList).toContain('saved');
  });
});
