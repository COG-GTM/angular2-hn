import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsServiceStub } from '../../testing/settings-service.stub';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  let settingsService: SettingsServiceStub;

  const story = {
    id: 1,
    title: 'Hello',
    points: 42,
    user: 'pg',
    time_ago: '1 hour ago',
    type: 'story',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments_count: 3,
  } as any as Story;

  beforeEach(async(() => {
    settingsService = new SettingsServiceStub();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = { ...story };
  });

  it('renders an external link for stories with a url', () => {
    fixture.detectChanges();
    const title: HTMLAnchorElement = fixture.nativeElement.querySelector('a.title');
    expect(component.hasUrl).toBe(true);
    expect(title.getAttribute('href')).toBe(story.url);
    expect(title.getAttribute('target')).toBeNull();
    expect(fixture.nativeElement.querySelector('.domain').textContent).toContain('example.com');
    expect(fixture.nativeElement.textContent).toContain('3 comments');
  });

  it('opens in a new tab when the setting is enabled', () => {
    settingsService.settings.openLinkInNewTab = true;
    fixture.detectChanges();
    const title: HTMLAnchorElement = fixture.nativeElement.querySelector('a.title');
    expect(title.getAttribute('target')).toBe('_blank');
    expect(title.getAttribute('rel')).toBe('noopener');
  });

  it('links internally for stories without a url', () => {
    component.item.url = 'item?id=1';
    fixture.detectChanges();
    const title: HTMLAnchorElement = fixture.nativeElement.querySelector('a.title');
    expect(component.hasUrl).toBe(false);
    expect(title.getAttribute('href')).toBe('/item/1');
  });

  it('hides points and comments for jobs', () => {
    component.item.type = 'job';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.comment-number')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('points by');
  });

  it('applies font size and spacing from settings', () => {
    settingsService.settings.titleFontSize = '20';
    settingsService.settings.listSpacing = '8';
    fixture.detectChanges();
    const title: HTMLElement = fixture.nativeElement.querySelector('a.title');
    expect(title.style.fontSize).toBe('20px');
    expect((fixture.nativeElement.firstElementChild as HTMLElement).style.marginBottom).toBe('8px');
  });
});
