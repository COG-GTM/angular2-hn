import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;

  const buildStory = (points: number): Story => {
    const story = new Story();
    story.id = 1;
    story.title = 'A story';
    story.points = points;
    story.user = 'someone';
    story.type = 'story';
    story.url = 'https://example.com';
    story.domain = 'example.com';
    story.time_ago = 1;
    story.comments_count = 0;
    return story;
  };

  const hotLabels = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.domain'))
      .map((element: HTMLElement) => element.textContent.trim());

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      imports: [RouterTestingModule, PipesModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('does not mark a story with 299 points as hot', () => {
    component.item = buildStory(299);
    fixture.detectChanges();

    expect(component.isHot).toBe(false);
    expect(hotLabels()).not.toContain('hot');
  });

  it('marks a story with 300 points as hot in both layouts', () => {
    component.item = buildStory(300);
    fixture.detectChanges();

    expect(component.isHot).toBe(true);
    expect(hotLabels().filter(text => text === 'hot').length).toBe(2);
  });
});
