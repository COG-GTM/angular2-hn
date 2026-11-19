import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { Story } from '../shared/models/story';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { ItemDetailsComponent } from './item-details.component';

const story = (overrides: Partial<Story> = {}): Story => ({
    id: 1,
    title: 'A story',
    points: 42,
    user: 'pg',
    time: 0,
    time_ago: '2 hours ago',
    type: 'link',
    url: 'https://example.com/post',
    domain: 'example.com',
    content: '',
    comments: [
        { id: 2, level: 0, user: 'alice', time: 0, time_ago: '1 hour ago', content: '<p>First</p>', comments: [] },
    ],
    comments_count: 1,
    ...overrides,
});

describe('ItemDetailsComponent', () => {
    let fetchItemContent: ReturnType<typeof vi.fn>;
    let back: ReturnType<typeof vi.fn>;

    async function render(id = '1') {
        const fixture = TestBed.createComponent(ItemDetailsComponent);
        fixture.componentRef.setInput('id', id);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        return { fixture, el: fixture.nativeElement as HTMLElement };
    }

    beforeEach(async () => {
        fetchItemContent = vi.fn();
        back = vi.fn();
        localStorage.clear();
        window.matchMedia = ((query: string) => ({
            matches: false,
            media: query,
            addEventListener: () => {},
        })) as never;
        window.scrollTo = vi.fn() as never;
        await TestBed.configureTestingModule({
            imports: [ItemDetailsComponent],
            providers: [
                provideRouter([]),
                { provide: HackerNewsAPIService, useValue: { fetchItemContent } },
                { provide: Location, useValue: { back } },
            ],
        }).compileComponents();
    });

    it('shows the loader while the item is loading', async () => {
        fetchItemContent.mockReturnValue(new Subject<Story>());
        const { el } = await render();
        expect(el.querySelector('app-loader')).toBeTruthy();
        expect(el.querySelector('.item')).toBeNull();
    });

    it('fetches the item for the route id and renders the header', async () => {
        fetchItemContent.mockReturnValue(of(story()));
        const { el } = await render('1');
        expect(fetchItemContent).toHaveBeenCalledWith(1);
        const laptop = el.querySelector('.laptop')!;
        expect(laptop.querySelector('a.title')!.getAttribute('href')).toBe('https://example.com/post');
        expect(laptop.querySelector('.domain')!.textContent).toBe('(example.com)');
        expect(laptop.querySelector('.subtext')!.textContent).toContain('42 points by');
        expect(laptop.querySelector('.subtext')!.textContent).toContain('1 comment');
        expect(laptop.classList).toContain('item-header');
        expect(el.querySelectorAll('.comment-list > li app-comment').length).toBe(1);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('links the title to the item page when the url is not external', async () => {
        fetchItemContent.mockReturnValue(
            of(story({ url: 'item?id=1', domain: undefined, content: '<p>Ask text</p>' }))
        );
        const { el } = await render();
        expect(el.querySelector('.laptop a.title')!.getAttribute('href')).toBe('/item/1');
        expect(el.querySelector('.laptop .domain')).toBeNull();
        expect(el.querySelector('.subject')!.innerHTML).toBe('<p>Ask text</p>');
    });

    it('opens external links in a new tab when the setting is on', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        fetchItemContent.mockReturnValue(of(story()));
        const { el } = await render();
        const link = el.querySelector('.laptop a.title')!;
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener');
    });

    it('hides points and comment count for jobs', async () => {
        fetchItemContent.mockReturnValue(of(story({ type: 'job', comments_count: 0, comments: [] })));
        const { el } = await render();
        const subtext = el.querySelector('.laptop .subtext')!;
        expect(subtext.textContent).not.toContain('points by');
        expect(subtext.textContent).not.toContain('|');
        expect(subtext.querySelector('.item-details')).toBeNull();
        expect(el.querySelector('.laptop')!.classList).toContain('item-header');
    });

    it('renders poll results with bars sized by share of votes', async () => {
        fetchItemContent.mockReturnValue(
            of(
                story({
                    type: 'poll',
                    poll: [
                        { content: '<p>Yes</p>', points: 30 },
                        { content: '<p>No</p>', points: 10 },
                    ],
                    poll_votes_count: 40,
                })
            )
        );
        const { el } = await render();
        const options = el.querySelectorAll<HTMLElement>('.pollResults .pollContent');
        expect(options.length).toBe(2);
        expect(options[0].querySelector('.subtext')!.textContent).toBe('30 points');
        expect(options[0].querySelector<HTMLElement>('.pollBar')!.style.width).toBe('75%');
        expect(options[1].querySelector<HTMLElement>('.pollBar')!.style.width).toBe('25%');
    });

    it('shows the error message when the item fails to load', async () => {
        fetchItemContent.mockReturnValue(throwError(() => new Error('boom')));
        const { el } = await render();
        expect(el.querySelector('app-loader')).toBeNull();
        expect(el.querySelector('app-error-message')).toBeTruthy();
        expect(el.querySelector('app-error-message')!.textContent).toContain('Could not load item comments.');
    });

    it('goes back from the mobile back button', async () => {
        fetchItemContent.mockReturnValue(of(story()));
        const { el } = await render();
        el.querySelector<HTMLElement>('.back-button')!.click();
        expect(back).toHaveBeenCalled();
    });
});
