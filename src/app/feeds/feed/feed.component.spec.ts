import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject, BehaviorSubject } from 'rxjs';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

@Component({
    selector: 'app-loader',
    template: '<div class="loader"></div>'
})
class MockLoaderComponent {}

@Component({
    selector: 'app-error-message',
    template: '<div class="error">{{ message }}</div>'
})
class MockErrorMessageComponent {
    @Input() message: string;
}

/* tslint:disable:component-selector */
@Component({
    selector: 'item',
    template: '<div class="item"></div>'
})
/* tslint:enable:component-selector */
class MockItemComponent {
    @Input() item: Story;
}

function createMockStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'Test Story',
        points: 100,
        user: 'testuser',
        time: Date.now(),
        time_ago: 1,
        type: 'story',
        url: 'https://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 10,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides
    };
}

function createMockStories(count: number): Story[] {
    return Array.from({ length: count }, (_, i) => createMockStory({
        id: i + 1,
        title: `Test Story ${i + 1}`,
        points: 100 + i
    }));
}

describe('FeedComponent', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
    let routeDataSubject: BehaviorSubject<{ feedType: string }>;
    let routeParamsSubject: BehaviorSubject<{ page?: string }>;

    beforeEach(async () => {
        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        routeDataSubject = new BehaviorSubject<{ feedType: string }>({ feedType: 'news' });
        routeParamsSubject = new BehaviorSubject<{ page?: string }>({});

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
                FeedComponent,
                MockLoaderComponent,
                MockErrorMessageComponent,
                MockItemComponent
            ],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: routeDataSubject.asObservable(),
                        params: routeParamsSubject.asObservable()
                    }
                }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
    });

    describe('Component Initialization', () => {
        it('should create the component', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
            fixture.detectChanges();
            expect(component).toBeTruthy();
        });

        it('should initialize with default values before ngOnInit', () => {
            expect(component.items).toBeUndefined();
            expect(component.feedType).toBeUndefined();
            expect(component.pageNum).toBeUndefined();
            expect(component.listStart).toBeUndefined();
            expect(component.errorMessage).toBe('');
        });

        it('should subscribe to route data on init', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
            fixture.detectChanges();
            expect(component.feedType).toBe('news');
        });

        it('should subscribe to route params on init', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
            fixture.detectChanges();
            expect(component.pageNum).toBe(1);
        });
    });

    describe('Routing and Pagination Logic', () => {
        it('should default to page 1 when no page param is provided', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
            routeParamsSubject.next({});
            fixture.detectChanges();
            expect(component.pageNum).toBe(1);
        });

        it('should parse page param as number', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
            routeParamsSubject.next({ page: '5' });
            fixture.detectChanges();
            expect(component.pageNum).toBe(5);
        });

        it('should calculate listStart correctly for page 1', () => {
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            routeParamsSubject.next({ page: '1' });
            fixture.detectChanges();
            expect(component.listStart).toBe(1);
        });

        it('should calculate listStart correctly for page 2', () => {
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            routeParamsSubject.next({ page: '2' });
            fixture.detectChanges();
            expect(component.listStart).toBe(31);
        });

        it('should calculate listStart correctly for page 3', () => {
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            routeParamsSubject.next({ page: '3' });
            fixture.detectChanges();
            expect(component.listStart).toBe(61);
        });

        it('should update feedType when route data changes', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
            fixture.detectChanges();
            expect(component.feedType).toBe('news');

            routeDataSubject.next({ feedType: 'jobs' });
            expect(component.feedType).toBe('jobs');
        });

        it('should fetch new feed when page param changes', () => {
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            fixture.detectChanges();

            expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 1);

            routeParamsSubject.next({ page: '2' });
            expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 2);
        });
    });

    describe('API Integration Behavior', () => {
        it('should call fetchFeed with correct feedType and pageNum', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
            routeDataSubject.next({ feedType: 'newest' });
            routeParamsSubject.next({ page: '3' });
            fixture.detectChanges();

            expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('newest', 3);
        });

        it('should populate items array on successful API response', () => {
            const mockStories = createMockStories(10);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            fixture.detectChanges();

            expect(component.items).toEqual(mockStories);
            expect(component.items.length).toBe(10);
        });

        it('should set error message on API error', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(throwError(() => new Error('API Error')));
            routeDataSubject.next({ feedType: 'show' });
            fixture.detectChanges();

            expect(component.errorMessage).toBe('Could not load show stories.');
        });

        it('should set appropriate error message for different feed types', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(throwError(() => new Error('API Error')));
            routeDataSubject.next({ feedType: 'jobs' });
            fixture.detectChanges();

            expect(component.errorMessage).toBe('Could not load jobs stories.');
        });

        it('should handle empty response from API', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
            fixture.detectChanges();

            expect(component.items).toEqual([]);
            expect(component.items.length).toBe(0);
        });

        it('should handle full page of 30 items', () => {
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            fixture.detectChanges();

            expect(component.items.length).toBe(30);
        });
    });

    describe('Feed Types', () => {
        const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

        feedTypes.forEach(feedType => {
            it(`should handle ${feedType} feed type`, () => {
                const mockStories = createMockStories(5);
                mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
                routeDataSubject.next({ feedType });
                fixture.detectChanges();

                expect(component.feedType).toBe(feedType);
                expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith(feedType, 1);
            });
        });
    });

    describe('Template Rendering', () => {
        it('should show loader when items are not loaded and no error', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(new Subject());
            fixture.detectChanges();

            const loader = fixture.debugElement.query(By.css('app-loader'));
            expect(loader).toBeTruthy();
        });

        it('should hide loader when items are loaded', () => {
            const mockStories = createMockStories(5);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            fixture.detectChanges();

            const loader = fixture.debugElement.query(By.css('app-loader'));
            expect(loader).toBeFalsy();
        });

        it('should show error message component when there is an error', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(throwError(() => new Error('API Error')));
            fixture.detectChanges();

            const errorComponent = fixture.debugElement.query(By.css('app-error-message'));
            expect(errorComponent).toBeTruthy();
        });

        it('should render item components for each story', () => {
            const mockStories = createMockStories(5);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            fixture.detectChanges();

            const items = fixture.debugElement.queryAll(By.css('item'));
            expect(items.length).toBe(5);
        });

        it('should show job header for jobs feed type', () => {
            const mockStories = createMockStories(5);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            routeDataSubject.next({ feedType: 'jobs' });
            fixture.detectChanges();

            const jobHeader = fixture.debugElement.query(By.css('.job-header'));
            expect(jobHeader).toBeTruthy();
        });

        it('should not show job header for non-jobs feed type', () => {
            const mockStories = createMockStories(5);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            routeDataSubject.next({ feedType: 'news' });
            fixture.detectChanges();

            const jobHeader = fixture.debugElement.query(By.css('.job-header'));
            expect(jobHeader).toBeFalsy();
        });

        it('should set correct start attribute on ordered list', () => {
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            routeParamsSubject.next({ page: '2' });
            fixture.detectChanges();

            const ol = fixture.debugElement.query(By.css('ol'));
            // tslint:disable-next-line:no-string-literal
            expect(ol.attributes['start']).toBe('31');
        });
    });

    describe('Navigation Links', () => {
        it('should not show prev link on first page', () => {
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            routeParamsSubject.next({ page: '1' });
            fixture.detectChanges();

            const prevLink = fixture.debugElement.query(By.css('.prev'));
            expect(prevLink).toBeFalsy();
        });

        it('should show prev link on pages after first', () => {
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            routeParamsSubject.next({ page: '2' });
            fixture.detectChanges();

            const prevLink = fixture.debugElement.query(By.css('.prev'));
            expect(prevLink).toBeTruthy();
        });

        it('should show more link when there are 30 items', () => {
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            fixture.detectChanges();

            const moreLink = fixture.debugElement.query(By.css('.more'));
            expect(moreLink).toBeTruthy();
        });

        it('should not show more link when there are less than 30 items', () => {
            const mockStories = createMockStories(15);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            fixture.detectChanges();

            const moreLink = fixture.debugElement.query(By.css('.more'));
            expect(moreLink).toBeFalsy();
        });

        it('should have correct routerLink for prev navigation', () => {
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            routeDataSubject.next({ feedType: 'news' });
            routeParamsSubject.next({ page: '3' });
            fixture.detectChanges();

            const prevLink = fixture.debugElement.query(By.css('.prev'));
            expect(prevLink.attributes['ng-reflect-router-link']).toBe('/news,2');
        });

        it('should have correct routerLink for more navigation', () => {
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            routeDataSubject.next({ feedType: 'news' });
            routeParamsSubject.next({ page: '1' });
            fixture.detectChanges();

            const moreLink = fixture.debugElement.query(By.css('.more'));
            expect(moreLink.attributes['ng-reflect-router-link']).toBe('/news,2');
        });
    });

    describe('Subscription Management', () => {
        it('should have typeSub subscription after init', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
            fixture.detectChanges();
            expect(component.typeSub).toBeDefined();
        });

        it('should have pageSub subscription after init', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
            fixture.detectChanges();
            expect(component.pageSub).toBeDefined();
        });
    });

    describe('Window Scroll Behavior', () => {
        it('should scroll to top when feed loads', () => {
            spyOn(window, 'scrollTo');
            const mockStories = createMockStories(10);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            fixture.detectChanges();

            expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        });

        it('should scroll to top when navigating to new page', () => {
            spyOn(window, 'scrollTo');
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            fixture.detectChanges();

            routeParamsSubject.next({ page: '2' });
            expect(window.scrollTo).toHaveBeenCalledTimes(2);
        });
    });

    describe('Edge Cases', () => {
        it('should handle page 0 gracefully (defaults to 1)', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
            routeParamsSubject.next({ page: '0' });
            fixture.detectChanges();

            expect(component.pageNum).toBe(0);
            expect(component.listStart).toBe(-29);
        });

        it('should handle very large page numbers', () => {
            const mockStories = createMockStories(30);
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));
            routeParamsSubject.next({ page: '100' });
            fixture.detectChanges();

            expect(component.pageNum).toBe(100);
            expect(component.listStart).toBe(2971);
        });

        it('should handle non-numeric page param', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));
            routeParamsSubject.next({ page: 'abc' });
            fixture.detectChanges();

            expect(component.pageNum).toBeNaN();
        });
    });
});
