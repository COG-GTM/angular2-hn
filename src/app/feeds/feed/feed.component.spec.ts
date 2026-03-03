import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Component, Input } from '@angular/core';
import { Story } from '../../shared/models/story';

@Component({ selector: 'item', template: '' })
class MockItemComponent {
    @Input() item: Story;
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
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;

    const mockStories: Story[] = [
        {
            id: 1,
            title: 'Test Story',
            points: 100,
            user: 'testuser',
            time: 1234567890,
            time_ago: 1,
            type: 'story',
            url: 'https://example.com',
            domain: 'example.com',
            comments: [],
            comments_count: 5,
            poll: [],
            poll_votes_count: 0,
            deleted: false,
            dead: false,
        } as Story,
    ];

    beforeEach(async(() => {
        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockItemComponent, MockLoaderComponent, MockErrorMessageComponent],
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

    it('should fetch feed items on init', () => {
        expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 1);
    });

    it('should set items after fetching', () => {
        expect(component.items).toEqual(mockStories);
    });

    it('should calculate listStart correctly for page 1', () => {
        expect(component.listStart).toBe(1);
    });
});
