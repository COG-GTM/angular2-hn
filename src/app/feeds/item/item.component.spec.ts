import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { Story } from '../../shared/models/story';

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'A story title',
    points: 10,
    user: 'alice',
    time: 1,
    time_ago: 5,
    type: 'story',
    url: 'http://example.com/a',
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
  } as Story;
}

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemComponent, CommentPipe],
    }).compileComponents();
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('renders an external link title with the domain', () => {
    component.item = makeStory();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const link = el.querySelector('a.title') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('http://example.com/a');
    expect(el.querySelector('.domain')!.textContent).toContain('(example.com)');
  });

  it('renders an internal /item link when the url is not http', () => {
    component.item = makeStory({ url: 'item?id=1', domain: '' });
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a.title') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/item/1');
  });

  it('renders comment count via the comment pipe', () => {
    component.item = makeStory({ comments_count: 3 });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('3 comments');
  });

  it('renders "discuss" when there are no comments', () => {
    component.item = makeStory({ comments_count: 0 });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('discuss');
  });

  it('hides points and user for job items', () => {
    component.item = makeStory({ type: 'job' });
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent!;
    expect(text).not.toContain('alice');
    expect(text).not.toContain('★');
  });
});
