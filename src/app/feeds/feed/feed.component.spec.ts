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

@Component({ selector: 'item', template: '' })
class MockItemComponent {
    @Input() item: any;
}

function createMockStory(overrides: Partial<Story> = {}): Story {
    const story = new Story();
    story.id = 1;
    story.title = 'Test Story';
    story.points = 100;
    story.user = 'testuser';
    story.time = 1234567890;
    story.time_ago = 1;
    story.type = 'story';
    story.url = 'https://example.com';
    story.domain = 'example.com';
    story.comments = [];
    story.comments_count = 5;
    Object.assign(story, overrides);
    return story;
}

describe('FeedComponent', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockHNService: any;
    let mockItems: Story[];

    beforeEach(async(() => {
        mockItems = [createMockStory()];
        mockHNService = {
            fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(of(mockItems))
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockLoaderComponent, MockErrorMessageComponent, MockItemComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'news' }),
                        params: of({ page: '1' })
                    }
                }
            ]
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

    it('should fetch feed items on init', () => {
        expect(mockHNService.fetchFeed).toHaveBeenCalledWith('news', 1);
    });

    it('should set items after fetching', () => {
        expect(component.items).toEqual(mockItems);
    });

    it('should calculate listStart correctly for page 1', () => {
        expect(component.listStart).toBe(1);
    });

    it('should scroll to top after loading', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should set errorMessage on fetch error', () => {
        mockHNService.fetchFeed.and.returnValue(throwError('error'));

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockLoaderComponent, MockErrorMessageComponent, MockItemComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'show' }),
                        params: of({ page: '1' })
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.errorMessage).toBe('Could not load show stories.');
    });

    it('should default pageNum to 1 when no page param', () => {
        TestBed.resetTestingModule();
        mockHNService.fetchFeed.and.returnValue(of(mockItems));
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockLoaderComponent, MockErrorMessageComponent, MockItemComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'news' }),
                        params: of({})
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.pageNum).toBe(1);
    });

    it('should calculate listStart correctly for page 2', () => {
        TestBed.resetTestingModule();
        mockHNService.fetchFeed.and.returnValue(of(mockItems));
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockLoaderComponent, MockErrorMessageComponent, MockItemComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: of({ feedType: 'news' }),
                        params: of({ page: '2' })
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.listStart).toBe(31);
    });

    it('should have empty errorMessage initially', () => {
        expect(component.errorMessage).toBe('');
    });
});
