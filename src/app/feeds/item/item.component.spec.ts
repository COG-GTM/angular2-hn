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
  let element: HTMLElement;
  let settings: Settings;

  function story(overrides: Partial<Story> = {}): Story {
    return {
      id: 123,
      title: 'Show HN: Angular 2 HN',
      points: 42,
      user: 'housseindjirdeh',
      time_ago: '3 hours ago',
      type: 'story',
      url: 'https://github.com/hdjirdeh/angular2-hn',
      domain: 'github.com',
      comments_count: 5,
      ...overrides,
    } as Story;
  }

  function render(item: Story) {
    component.item = item;
    fixture.detectChanges();
  }

  beforeEach(async(() => {
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: SettingsService, useValue: { settings } }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should create', () => {
    render(story());

    expect(component).toBeTruthy();
  });

  it('should link the title to the external URL and show the domain', () => {
    render(story());

    const title: HTMLAnchorElement = element.querySelector('a.title');
    expect(component.hasUrl).toBe(true);
    expect(title.textContent.trim()).toBe('Show HN: Angular 2 HN');
    expect(title.getAttribute('href')).toBe('https://github.com/hdjirdeh/angular2-hn');
    expect(title.hasAttribute('target')).toBe(false);
    expect(element.querySelector('.domain').textContent).toBe('(github.com)');
  });

  it('should open external links in a new tab when the setting is enabled', () => {
    settings.openLinkInNewTab = true;
    render(story());

    const title: HTMLAnchorElement = element.querySelector('a.title');
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
  });

  it('should link the title to the item page for self posts', () => {
    render(story({ url: 'item?id=123', domain: undefined }));

    expect(component.hasUrl).toBe(false);
    expect(element.querySelector('a.title').getAttribute('href')).toBe('/item/123');
    expect(element.querySelector('.domain')).toBeNull();
  });

  it('should render points, author and comment count', () => {
    render(story());

    const laptop = element.querySelector('.subtext-laptop');
    expect(laptop.textContent).toContain('42 points by');
    expect(laptop.querySelector('a[href="/user/housseindjirdeh"]').textContent).toBe('housseindjirdeh');
    expect(laptop.querySelector('a[href="/item/123"]').textContent.trim()).toBe('5 comments');
    expect(element.querySelector('.subtext-palm .right').textContent).toBe('42 ★');
  });

  it('should show "discuss" when an item has no comments', () => {
    render(story({ comments_count: 0 }));

    expect(element.querySelector('.subtext-laptop a[href="/item/123"]').textContent.trim()).toBe('discuss');
  });

  it('should hide author, points and comments for jobs', () => {
    render(story({ type: 'job' }));

    expect(element.textContent).not.toContain('points by');
    expect(element.querySelector('a[href="/user/housseindjirdeh"]')).toBeNull();
    expect(element.querySelector('.comment-number')).toBeNull();
    expect(element.textContent).toContain('3 hours ago');
  });

  it('should apply the font size and list spacing settings', () => {
    settings.titleFontSize = '20';
    settings.listSpacing = '10';
    render(story());

    expect(element.querySelector<HTMLElement>('a.title').style.fontSize).toBe('20px');
    expect(element.querySelector<HTMLElement>('div').style.marginBottom).toBe('10px');
  });
});
