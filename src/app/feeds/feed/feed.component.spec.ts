import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';

import { FeedType } from '../../shared/models/feed-type.type';
import { Story } from '../../shared/models/story';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { FeedComponent } from './feed.component';

const stories = (count: number): Story[] =>
    Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        title: `Story ${i + 1}`,
        points: 10,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'link',
        url: `https://example.com/${i + 1}`,
        domain: 'example.com',
        comments: [],
        comments_count: 3,
    }));

describe('FeedComponent', () => {
    let fixture: ComponentFixture<FeedComponent>;
    let el: HTMLElement;
    let response: Subject<Story[]>;
    let fetchFeed: ReturnType<typeof vi.fn>;

    const render = (feedType: FeedType, page?: string) => {
        fixture = TestBed.createComponent(FeedComponent);
        fixture.componentRef.setInput('feedType', feedType);
        fixture.componentRef.setInput('page', page);
        fixture.detectChanges();
        el = fixture.nativeElement;
    };

    const respond = (items: Story[]) => {
        response.next(items);
        response.complete();
        fixture.detectChanges();
    };

    beforeEach(() => {
        window.matchMedia = ((query: string) => ({ matches: false, media: query, addEventListener: () => {} })) as never;
        window.scrollTo = vi.fn() as never;
        response = new Subject<Story[]>();
        fetchFeed = vi.fn(() => response);
        TestBed.configureTestingModule({
            imports: [FeedComponent],
            providers: [provideRouter([]), { provide: HackerNewsAPIService, useValue: { fetchFeed } }],
        });
    });

    it('shows the loader while the feed loads', () => {
        render('news', '1');
        expect(fetchFeed).toHaveBeenCalledWith('news', 1);
        expect(el.querySelector('app-loader')).toBeTruthy();
        expect(el.querySelector('ol')).toBeNull();
    });

    it('defaults to page 1 when no page param is given', () => {
        render('newest');
        expect(fetchFeed).toHaveBeenCalledWith('newest', 1);
    });

    it('renders a numbered list of stories and only "More" on the first full page', () => {
        render('news', '1');
        respond(stories(30));
        expect(el.querySelector('app-loader')).toBeNull();
        expect(el.querySelectorAll('li.post item.item-block')).toHaveLength(30);
        const list = el.querySelector('ol')!;
        expect(list.getAttribute('start')).toBe('1');
        expect(list.classList).toContain('list-margin');
        expect(el.querySelector('.prev')).toBeNull();
        expect(el.querySelector('.more')!.getAttribute('href')).toBe('/news/2');
        expect(el.querySelector('.more')!.textContent!.trim()).toBe('More ›');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('shows "Prev" and numbers from the page offset on later pages', () => {
        render('show', '3');
        respond(stories(30));
        expect(el.querySelector('ol')!.getAttribute('start')).toBe('61');
        expect(el.querySelector('.prev')!.getAttribute('href')).toBe('/show/2');
        expect(el.querySelector('.prev')!.textContent!.trim()).toBe('‹ Prev');
        expect(el.querySelector('.more')!.getAttribute('href')).toBe('/show/4');
    });

    it('hides "More" on a short last page', () => {
        render('ask', '2');
        respond(stories(12));
        expect(el.querySelector('.more')).toBeNull();
        expect(el.querySelector('.prev')).toBeTruthy();
    });

    it('shows the YC header and no list margin on the jobs feed', () => {
        render('jobs', '1');
        respond(stories(5));
        expect(el.querySelector('.job-header')!.textContent).toContain(
            'These are jobs at startups that were funded by Y Combinator.'
        );
        expect(el.querySelector('ol')!.classList).not.toContain('list-margin');
    });

    it('has no YC header on other feeds', () => {
        render('news', '1');
        respond(stories(5));
        expect(el.querySelector('.job-header')).toBeNull();
    });

    it('shows an error message when the feed fails to load', () => {
        render('newest', '1');
        response.error(new Error('offline'));
        fixture.detectChanges();
        expect(el.querySelector('app-loader')).toBeNull();
        expect(el.querySelector('app-error-message .strong')!.textContent).toBe('Could not load newest stories.');
    });

    it('fetches the new page when the page param changes', () => {
        render('news', '1');
        respond(stories(30));
        response = new Subject<Story[]>();
        fixture.componentRef.setInput('page', '2');
        fixture.detectChanges();
        expect(fetchFeed).toHaveBeenLastCalledWith('news', 2);
        respond(stories(30));
        expect(el.querySelector('ol')!.getAttribute('start')).toBe('31');
    });
});
