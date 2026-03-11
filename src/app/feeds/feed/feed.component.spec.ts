import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { Component, Input } from '@angular/core';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

@Component({ selector: 'app-loader', template: '' })
class MockLoaderComponent {}

@Component({ selector: 'app-error-message', template: '' })
class MockErrorMessageComponent {
    @Input() message: string;
}

// tslint:disable-next-line:component-selector
@Component({ selector: 'item', template: '' })
class MockItemComponent {
    @Input() item: any;
}

describe('FeedComponent', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;

    const mockStories: Story[] = [
        {
            id: 1,
            title: 'Test Story',
            points: 100,
            user: 'testuser',
            time: 1234567890,
            time_ago: 1234567890 as any,
            type: 'story',
            url: 'http://example.com',
            domain: 'example.com',
            comments: [],
            comments_count: 5,
            poll: [],
            poll_votes_count: 0,
            deleted: false,
            dead: false,
        },
    ];

    beforeEach(async(() => {
        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockLoaderComponent, MockErrorMessageComponent, MockItemComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'news' }),
                        params: of({ page: '1' }),
                    },
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
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

    it('should fetch feed on init', () => {
        expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 1);
    });

    it('should set items from API response', () => {
        expect(component.items).toEqual(mockStories);
    });

    it('should calculate listStart correctly for page 1', () => {
        expect(component.listStart).toBe(1);
    });

    it('should call window.scrollTo after loading', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should set errorMessage on API error', () => {
        mockHackerNewsAPIService.fetchFeed.and.returnValue(throwError('error'));

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockLoaderComponent, MockErrorMessageComponent, MockItemComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'news' }),
                        params: of({ page: '1' }),
                    },
                },
            ],
        }).compileComponents();

        const errorFixture = TestBed.createComponent(FeedComponent);
        const errorComponent = errorFixture.componentInstance;
        errorFixture.detectChanges();

        expect(errorComponent.errorMessage).toBe('Could not load news stories.');
    });

    it('should default pageNum to 1 when no page param', () => {
        TestBed.resetTestingModule();
        mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockLoaderComponent, MockErrorMessageComponent, MockItemComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'news' }),
                        params: of({}),
                    },
                },
            ],
        }).compileComponents();

        const newFixture = TestBed.createComponent(FeedComponent);
        const newComponent = newFixture.componentInstance;
        newFixture.detectChanges();

        expect(newComponent.pageNum).toBe(1);
    });
});
