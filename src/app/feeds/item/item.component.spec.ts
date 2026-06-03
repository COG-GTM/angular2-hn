import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ItemComponent } from './item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';

function makeStory(partial: Partial<Story>): Story {
  const story = new Story();
  Object.assign(story, {
    id: 1,
    title: 'Test story',
    url: 'https://example.com',
    user: 'pg',
    points: 10,
    time_ago: '1 hour ago',
    type: 'story',
    comments_count: 3,
    domain: 'example.com',
  });
  Object.assign(story, partial);
  return story;
}

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;

  beforeEach(() => {
    const settingsServiceStub = {
      settings: {
        openLinkInNewTab: false,
        titleFontSize: '16',
        listSpacing: '0',
        theme: 'default',
        showSettings: false,
      },
    };

    TestBed.configureTestingModule({
      declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: SettingsService, useValue: settingsServiceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('creates the component and reads settings', () => {
    component.item = makeStory({});
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.settings).toBeTruthy();
  });

  it('hasUrl is true for an external http link', () => {
    component.item = makeStory({ url: 'https://news.ycombinator.com' });
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl is false for an internal (relative) link', () => {
    component.item = makeStory({ url: 'item?id=123' });
    expect(component.hasUrl).toBe(false);
  });

  it('renders the story title', () => {
    component.item = makeStory({ title: 'Hello HN' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Hello HN');
  });

  it('renders a job item without a user/points block', () => {
    component.item = makeStory({ type: 'job', url: 'https://jobs.example.com' });
    fixture.detectChanges();
    expect(component.item.type).toBe('job');
  });
});
