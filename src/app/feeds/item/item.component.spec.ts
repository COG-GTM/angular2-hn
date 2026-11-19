import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Story } from '../../shared/models/story';
import { ItemComponent } from './item.component';

const story = (overrides: Partial<Story> = {}): Story => ({
    id: 42,
    title: 'A story',
    points: 120,
    user: 'pg',
    time: 0,
    time_ago: '2 hours ago',
    type: 'link',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments: [],
    comments_count: 7,
    ...overrides,
});

describe('ItemComponent', () => {
    let fixture: ComponentFixture<ItemComponent>;
    let el: HTMLElement;

    const render = (item: Story) => {
        fixture = TestBed.createComponent(ItemComponent);
        fixture.componentRef.setInput('item', item);
        fixture.detectChanges();
        el = fixture.nativeElement;
    };

    beforeEach(() => {
        localStorage.clear();
        window.matchMedia = ((query: string) => ({ matches: false, media: query, addEventListener: () => {} })) as never;
        TestBed.configureTestingModule({ imports: [ItemComponent], providers: [provideRouter([])] });
    });

    it('links external stories to their url and shows the domain', () => {
        render(story());
        const title = el.querySelector<HTMLAnchorElement>('a.title')!;
        expect(title.getAttribute('href')).toBe('https://example.com/post');
        expect(title.textContent!.trim()).toBe('A story');
        expect(title.getAttribute('target')).toBeNull();
        expect(el.querySelector('.domain')!.textContent).toBe('(example.com)');
    });

    it('links self posts (ask/show) to the item page', () => {
        render(story({ type: 'ask', url: 'item?id=42', domain: undefined }));
        expect(el.querySelector('a.title')!.getAttribute('href')).toBe('/item/42');
        expect(el.querySelector('.domain')).toBeNull();
    });

    it('shows points, user and comment count for stories', () => {
        render(story());
        const laptop = el.querySelector('.subtext-laptop')!.textContent!.replace(/\s+/g, ' ');
        expect(laptop).toContain('120 points by pg');
        expect(laptop).toContain('2 hours ago | 7 comments');
        expect(el.querySelector('.subtext-palm .right')!.textContent).toBe('120 ★');
        expect(el.querySelector('.comment-number')!.getAttribute('href')).toBe('/item/42');
        expect(el.querySelector('.name a')!.getAttribute('href')).toBe('/user/pg');
    });

    it('shows "discuss" when there are no comments', () => {
        render(story({ comments_count: 0 }));
        expect(el.querySelector('.comment-number')!.textContent).toContain('discuss');
    });

    it('hides points, user and comments for jobs', () => {
        render(story({ type: 'job', points: null, user: null, comments_count: 0 }));
        expect(el.querySelector('.subtext-palm .name')).toBeNull();
        expect(el.querySelector('.comment-number')).toBeNull();
        expect(el.querySelector('.item-details')).toBeNull();
        expect(el.querySelector('.subtext-laptop')!.textContent!.trim()).toBe('2 hours ago');
    });

    it('applies title font size, list spacing and new-tab settings', () => {
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '8');
        localStorage.setItem('openLinkInNewTab', 'true');
        render(story());
        const title = el.querySelector<HTMLAnchorElement>('a.title')!;
        expect(title.style.fontSize).toBe('20px');
        expect(title.getAttribute('target')).toBe('_blank');
        expect(title.getAttribute('rel')).toBe('noopener');
        expect(el.querySelector<HTMLElement>(':scope > div')!.style.marginBottom).toBe('8px');
    });
});
