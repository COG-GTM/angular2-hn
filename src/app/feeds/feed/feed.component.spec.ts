import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { ItemComponent } from '../item/item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

function buildStories(count: number): Story[] {
    return Array.from({ length: count }, (_, i) => (({
        id: i + 1,
        title: `Story ${i + 1}`,
        points: 10,
        user: 'pg',
        time_ago: '1 hour ago',
        type: 'story',
        url: `https://example.com/${i + 1}`,
        domain: 'example.com',
        comments_count: i,
    } as unknown) as Story));
}

describe('FeedComponent', () => {
    let fixture: ComponentFixture<FeedComponent>;
    let component: FeedComponent;
    let api: jasmine.SpyObj<HackerNewsAPIService>;
    let routeData: BehaviorSubject<{ feedType: string }>;
    let routeParams: BehaviorSubject<{ page?: string }>;

    const settings: Settings = {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
    };

    const element = (): HTMLElement => fixture.nativeElement;

    function setup(feedType: string, params: { page?: string }) {
        routeData = new BehaviorSubject({ feedType });
        routeParams = new BehaviorSubject(params);
        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
    }

    beforeEach(() => {
        api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
        spyOn(window, 'scrollTo');

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule, SharedComponentsModule],
            declarations: [FeedComponent, ItemComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: api },
                { provide: SettingsService, useValue: { settings } },
                {
                    provide: ActivatedRoute,
                    useFactory: () => ({ data: routeData, params: routeParams }),
                },
            ],
        });
    });

    it('should request the feed type and page from the route', () => {
        setup('show', { page: '2' });
        api.fetchFeed.and.returnValue(of(buildStories(3)));

        fixture.detectChanges();

        expect(component.feedType).toBe('show');
        expect(component.pageNum).toBe(2);
        expect(api.fetchFeed).toHaveBeenCalledWith('show', 2);
    });

    it('should default to the first page when no page param is present', () => {
        setup('news', {});
        api.fetchFeed.and.returnValue(of(buildStories(3)));

        fixture.detectChanges();

        expect(api.fetchFeed).toHaveBeenCalledWith('news', 1);
        expect(component.listStart).toBe(1);
    });

    it('should show the loader while stories are loading', () => {
        setup('news', { page: '1' });
        api.fetchFeed.and.returnValue(new Subject<Story[]>());

        fixture.detectChanges();

        expect(element().querySelector('app-loader')).not.toBeNull();
        expect(element().querySelector('ol')).toBeNull();
    });

    it('should render one list entry per story, numbered from the page offset', () => {
        setup('news', { page: '2' });
        api.fetchFeed.and.returnValue(of(buildStories(5)));

        fixture.detectChanges();

        const posts = element().querySelectorAll('li.post');
        expect(posts.length).toBe(5);
        expect(posts[0].textContent).toContain('Story 1');
        expect(element().querySelector('ol').getAttribute('start')).toBe('31');
        expect(element().querySelector('app-loader')).toBeNull();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should show "More" only on full pages and "Prev" only after the first page', () => {
        setup('news', { page: '1' });
        api.fetchFeed.and.returnValue(of(buildStories(30)));

        fixture.detectChanges();

        expect(element().querySelector('a.more')).not.toBeNull();
        expect(element().querySelector('a.prev')).toBeNull();

        api.fetchFeed.and.returnValue(of(buildStories(10)));
        routeParams.next({ page: '3' });
        fixture.detectChanges();

        expect(element().querySelector('a.more')).toBeNull();
        expect(element().querySelector('a.prev')).not.toBeNull();
    });

    it('should link pagination to the neighbouring pages of the current feed', () => {
        setup('ask', { page: '2' });
        api.fetchFeed.and.returnValue(of(buildStories(30)));

        fixture.detectChanges();

        expect(element().querySelector('a.prev').getAttribute('href')).toBe('/ask/1');
        expect(element().querySelector('a.more').getAttribute('href')).toBe('/ask/3');
    });

    it('should refetch when the page param changes', () => {
        setup('newest', { page: '1' });
        api.fetchFeed.and.returnValue(of(buildStories(30)));
        fixture.detectChanges();

        routeParams.next({ page: '4' });

        expect(api.fetchFeed).toHaveBeenCalledTimes(2);
        expect(api.fetchFeed.calls.mostRecent().args).toEqual(['newest', 4]);
        expect(component.listStart).toBe(91);
    });

    it('should show the jobs header only for the jobs feed', () => {
        setup('jobs', { page: '1' });
        api.fetchFeed.and.returnValue(of(buildStories(2)));

        fixture.detectChanges();

        expect(element().querySelector('.job-header')).not.toBeNull();
        expect(element().querySelector('ol').classList).not.toContain('list-margin');
    });

    it('should show an error message when the feed fails to load', () => {
        setup('news', { page: '1' });
        api.fetchFeed.and.returnValue(throwError(new Error('offline')));

        fixture.detectChanges();

        expect(component.errorMessage).toBe('Could not load news stories.');
        expect(element().querySelector('app-error-message')).not.toBeNull();
        expect(element().querySelector('app-loader')).toBeNull();
    });
});
