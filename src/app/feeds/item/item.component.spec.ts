import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let settings: Settings;

  const makeStory = (overrides: Partial<Story> = {}): Story => ({
    id: 42,
    title: 'Hello HN',
    points: 128,
    user: 'pg',
    time_ago: '3 hours ago',
    type: 'link',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments_count: 7,
    ...overrides,
  } as Story);

  beforeEach(async(() => {
    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemComponent, CommentPipe],
      providers: [
        { provide: SettingsService, useValue: { settings } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  const query = (selector: string) => fixture.nativeElement.querySelector(selector);
  const queryAll = (selector: string) => fixture.nativeElement.querySelectorAll(selector);

  function render(story: Story) {
    component.item = story;
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read settings from SettingsService', () => {
    expect(component.settings).toBe(settings);
  });

  describe('hasUrl', () => {
    it('should be true for http and https urls', () => {
      component.item = makeStory({ url: 'http://example.com' });
      expect(component.hasUrl).toBe(true);
      component.item = makeStory({ url: 'https://example.com' });
      expect(component.hasUrl).toBe(true);
    });

    it('should be false for internal item paths', () => {
      component.item = makeStory({ url: 'item?id=42' });
      expect(component.hasUrl).toBe(false);
    });
  });

  describe('template', () => {
    it('should render an external title link with the domain', () => {
      render(makeStory());
      const title = query('a.title');
      expect(title.getAttribute('href')).toBe('https://example.com/post');
      expect(title.textContent.trim()).toBe('Hello HN');
      expect(query('.domain').textContent).toBe('(example.com)');
    });

    it('should omit the domain when the story has none', () => {
      render(makeStory({ domain: undefined }));
      expect(query('a.title')).toBeTruthy();
      expect(query('.domain')).toBeNull();
    });

    it('should open external links in the same tab by default', () => {
      render(makeStory());
      const title = query('a.title');
      expect(title.getAttribute('target')).toBeNull();
      expect(title.getAttribute('rel')).toBeNull();
    });

    it('should open external links in a new tab when the setting is enabled', () => {
      settings.openLinkInNewTab = true;
      render(makeStory());
      const title = query('a.title');
      expect(title.getAttribute('target')).toBe('_blank');
      expect(title.getAttribute('rel')).toBe('noopener');
    });

    it('should link the title to the item route when there is no external url', () => {
      render(makeStory({ url: 'item?id=42' }));
      const title = query('a.title');
      expect(title.getAttribute('href')).toBe('/item/42');
      expect(query('.domain')).toBeNull();
    });

    it('should apply title font size and list spacing from settings', () => {
      settings.titleFontSize = '20';
      settings.listSpacing = '12';
      render(makeStory());
      expect(query('a.title').style.fontSize).toBe('20px');
      expect(fixture.nativeElement.querySelector('div').style.marginBottom).toBe('12px');
    });

    it('should render points, user link, time and comment count for stories', () => {
      render(makeStory());
      const palm = query('.subtext-palm');
      expect(palm.querySelector('.name a').getAttribute('href')).toBe('/user/pg');
      expect(palm.querySelector('.name a').textContent).toBe('pg');
      expect(palm.querySelector('.right').textContent).toContain('128');
      expect(palm.textContent).toContain('3 hours ago');
      expect(palm.querySelector('a.comment-number').getAttribute('href')).toBe('/item/42');
      expect(palm.querySelector('a.comment-number').textContent).toContain('7 comments');

      const laptop = query('.subtext-laptop');
      expect(laptop.textContent).toContain('128 points by');
      expect(laptop.querySelector('a[href="/user/pg"]')).toBeTruthy();
      expect(laptop.querySelector('a[href="/item/42"]').textContent).toContain('7 comments');
      expect(laptop.querySelector('.item-details')).toBeTruthy();
    });

    it('should show "discuss" when there are no comments', () => {
      render(makeStory({ comments_count: 0 }));
      expect(query('a.comment-number').textContent).toContain('discuss');
    });

    it('should hide points, user and comment links for jobs', () => {
      render(makeStory({ type: 'job', comments_count: 0 }));
      expect(query('.subtext-palm .details .name')).toBeNull();
      expect(query('.subtext-palm .right')).toBeNull();
      expect(query('a.comment-number')).toBeNull();
      expect(queryAll('a[href="/user/pg"]').length).toBe(0);
      expect(queryAll('a[href="/item/42"]').length).toBe(0);
      expect(query('.subtext-laptop .item-details')).toBeNull();
      expect(query('.subtext-laptop').textContent).toContain('3 hours ago');
    });
  });
});
