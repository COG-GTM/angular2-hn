import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { item1001, item300 } from '../../testing/fixtures';

function configure(apiMock: Partial<HackerNewsAPIService>, params: any) {
  return TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    declarations: [
      ItemDetailsComponent,
      CommentComponent,
      CommentPipe,
      LoaderComponent,
      ErrorMessageComponent,
    ],
    providers: [
      { provide: HackerNewsAPIService, useValue: apiMock },
      { provide: ActivatedRoute, useValue: { params: of(params) } },
    ],
  }).compileComponents();
}

describe('ItemDetailsComponent', () => {
  afterEach(() => localStorage.clear());

  it('renders the story title, content and nested comments', async () => {
    await configure({ fetchItemContent: () => of(item1001 as any) }, { id: '1001' });
    const fixture: ComponentFixture<ItemDetailsComponent> = TestBed.createComponent(
      ItemDetailsComponent
    );
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.subject')!.innerHTML).toContain('story <b>content</b>');
    expect(el.textContent).toContain('Top level comment');
    expect(el.textContent).toContain('Nested reply');
    expect(el.textContent).toContain('[deleted]');
  });

  it('renders poll results with points and bars', async () => {
    const expandedPoll = {
      ...(item300 as any),
      poll: [
        { points: 60, content: 'React' },
        { points: 40, content: 'Angular' },
        { points: 20, content: 'Vue' },
      ],
      poll_votes_count: 120,
    };
    await configure({ fetchItemContent: () => of(expandedPoll) }, { id: '300' });
    const fixture: ComponentFixture<ItemDetailsComponent> = TestBed.createComponent(
      ItemDetailsComponent
    );
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const pollContents = el.querySelectorAll('.pollContent');
    expect(pollContents.length).toBe(3);
    expect(pollContents[0].textContent).toContain('60 points');
    const bar = pollContents[0].querySelector('.pollBar') as HTMLElement;
    expect(bar.style.width).toBe('50%');
  });

  it('renders an error message when the item fails to load', async () => {
    await configure({ fetchItemContent: () => throwError('boom') }, { id: '1001' });
    const fixture: ComponentFixture<ItemDetailsComponent> = TestBed.createComponent(
      ItemDetailsComponent
    );
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Could not load item comments.'
    );
  });
});
