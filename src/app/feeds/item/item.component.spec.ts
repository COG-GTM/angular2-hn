import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  let settings: Settings;

  const story = (overrides: Partial<Story> = {}): Story =>
    ({
      id: 123,
      title: 'Angular testing in depth',
      points: 42,
      user: 'alice',
      time_ago: '3 hours ago',
      type: 'story',
      url: 'https://example.com/post',
      domain: 'example.com',
      comments_count: 5,
      ...overrides,
    } as Story);

  beforeEach(() => {
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [ItemComponent],
      providers: [{ provide: SettingsService, useValue: { settings } }],
    });

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  function render(item: Story): HTMLElement {
    component.item = item;
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('reads settings from SettingsService', () => {
    expect(component.settings).toBe(settings);
  });

  describe('external stories', () => {
    it('links the title to the external URL and shows the domain', () => {
      const el = render(story());
      const title = el.querySelector('a.title') as HTMLAnchorElement;
      expect(component.hasUrl).toBe(true);
      expect(title.textContent.trim()).toBe('Angular testing in depth');
      expect(title.getAttribute('href')).toBe('https://example.com/post');
      expect(el.querySelector('.domain').textContent).toBe('(example.com)');
    });

    it('does not open in a new tab by default', () => {
      const title = render(story()).querySelector('a.title');
      expect(title.getAttribute('target')).toBeNull();
      expect(title.getAttribute('rel')).toBeNull();
    });

    it('opens in a new tab when the setting is on', () => {
      settings.openLinkInNewTab = true;
      const title = render(story()).querySelector('a.title');
      expect(title.getAttribute('target')).toBe('_blank');
      expect(title.getAttribute('rel')).toBe('noopener');
    });
  });

  describe('self posts', () => {
    it('links the title to the item details route', () => {
      const el = render(story({ url: 'item?id=123', domain: undefined }));
      expect(component.hasUrl).toBe(false);
      expect(el.querySelector('a.title').getAttribute('href')).toBe('/item/123');
      expect(el.querySelector('.domain')).toBeNull();
    });
  });

  it('shows points, author, age and comment count', () => {
    const el = render(story());
    const text = el.querySelector('.subtext-laptop').textContent.replace(/\s+/g, ' ');
    expect(text).toContain('42 points by alice');
    expect(text).toContain('3 hours ago');
    expect(text).toContain('5 comments');
    const userLinks = Array.from(el.querySelectorAll('a')).filter(a => a.getAttribute('href') === '/user/alice');
    expect(userLinks.length).toBe(2);
  });

  it('shows "discuss" when there are no comments', () => {
    const el = render(story({ comments_count: 0 }));
    expect(el.querySelector('.subtext-laptop').textContent).toContain('discuss');
  });

  it('hides author, points and comments for jobs', () => {
    const el = render(story({ type: 'job' }));
    expect(el.textContent).not.toContain('points by');
    expect(el.querySelector('.comment-number')).toBeNull();
    expect(el.querySelector('a[href="/user/alice"]')).toBeNull();
    expect(el.textContent).toContain('3 hours ago');
  });

  it('applies the title font size and list spacing settings', () => {
    settings.titleFontSize = '24';
    settings.listSpacing = '10';
    const el = render(story());
    expect((el.querySelector('a.title') as HTMLElement).style.fontSize).toBe('24px');
    expect((el.firstElementChild as HTMLElement).style.marginBottom).toBe('10px');
  });
});
