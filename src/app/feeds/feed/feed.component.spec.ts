import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Component, Input } from '@angular/core';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

@Component({ selector: 'item', template: '' })
class MockItemComponent {
    @Input() item: any;
}

@Component({ selector: 'app-loader', template: '' })
class MockLoaderComponent {}

@Component({ selector: 'app-error-message', template: '' })
class MockErrorMessageComponent {
    @Input() message: string;
}

describe('FeedComponent', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockHackerNewsService: jasmine.SpyObj<HackerNewsAPIService>;

    const mockStories: Story[] = [
        {
            id: 1,
            title: 'Test Story',
            points: 100,
            user: 'testuser',
            time: 1234567890,
            time_ago: 1,
            type: 'story',
            url: 'http://example.com',
            domain: 'example.com',
            comments: [],
            comments_count: 5,
            poll: [],
            poll_votes_count: 0,
            deleted: false,
            dead: false,
        } as Story,
    ];

    beforeEach(() => {
        mockHackerNewsService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        mockHackerNewsService.fetchFeed.and.returnValue(of(mockStories));

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockItemComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'news' }),
                        params: of({ page: '1' }),
                    },
                },
            ],
        }).compileComponents();

        spyOn(window, 'scrollTo');

        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set feedType from route data', () => {
        expect(component.feedType).toBe('news');
    });

    it('should set pageNum from route params', () => {
        expect(component.pageNum).toBe(1);
    });

    it('should fetch feed items on init', () => {
        expect(mockHackerNewsService.fetchFeed).toHaveBeenCalledWith('news', 1);
        expect(component.items).toEqual(mockStories);
    });

    it('should calculate listStart correctly for page 1', () => {
        expect(component.listStart).toBe(1);
    });

    it('should call window.scrollTo on feed load', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should default pageNum to 1 when not provided', () => {
        // Already tested with params having page: '1'
        expect(component.pageNum).toBe(1);
    });
});

describe('FeedComponent with page 2', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockHackerNewsService: jasmine.SpyObj<HackerNewsAPIService>;

    const mockStories: Story[] = Array(30).fill({
        id: 1,
        title: 'Test Story',
        points: 100,
        user: 'testuser',
        time: 1234567890,
        time_ago: 1,
        type: 'story',
        url: 'http://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    } as Story);

    beforeEach(() => {
        mockHackerNewsService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        mockHackerNewsService.fetchFeed.and.returnValue(of(mockStories));

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockItemComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'news' }),
                        params: of({ page: '2' }),
                    },
                },
            ],
        }).compileComponents();

        spyOn(window, 'scrollTo');

        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should set pageNum to 2', () => {
        expect(component.pageNum).toBe(2);
    });

    it('should calculate listStart correctly for page 2', () => {
        expect(component.listStart).toBe(31);
    });
});

describe('FeedComponent without page param', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockHackerNewsService: jasmine.SpyObj<HackerNewsAPIService>;

    const mockStories: Story[] = [
        {
            id: 1,
            title: 'Test Story',
            points: 100,
            user: 'testuser',
            time: 1234567890,
            time_ago: 1,
            type: 'story',
            url: 'http://example.com',
            domain: 'example.com',
            comments: [],
            comments_count: 5,
            poll: [],
            poll_votes_count: 0,
            deleted: false,
            dead: false,
        } as Story,
    ];

    beforeEach(() => {
        mockHackerNewsService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        mockHackerNewsService.fetchFeed.and.returnValue(of(mockStories));

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockItemComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'news' }),
                        params: of({}),
                    },
                },
            ],
        }).compileComponents();

        spyOn(window, 'scrollTo');

        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should default pageNum to 1 when no page param', () => {
        expect(component.pageNum).toBe(1);
    });

    it('should calculate listStart as 1 for default page', () => {
        expect(component.listStart).toBe(1);
    });
});

describe('FeedComponent with error', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockHackerNewsService: jasmine.SpyObj<HackerNewsAPIService>;

    beforeEach(() => {
        mockHackerNewsService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        mockHackerNewsService.fetchFeed.and.returnValue(throwError('Network error'));

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockItemComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'show' }),
                        params: of({ page: '1' }),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should set errorMessage on error', () => {
        expect(component.errorMessage).toBe('Could not load show stories.');
    });

    it('should not have items on error', () => {
        expect(component.items).toBeUndefined();
    });
});
