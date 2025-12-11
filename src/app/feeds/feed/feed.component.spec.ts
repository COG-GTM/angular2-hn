import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
    let component: FeedComponent;
    let fixture: ComponentFixture<FeedComponent>;
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
    let paramsSubject: Subject<any>;
    let dataSubject: Subject<any>;

    const mockStories: Story[] = [
        {
            id: 1,
            title: 'Test Story 1',
            points: 100,
            user: 'testuser',
            time: 1234567890,
            time_ago: 1234567890,
            type: 'story',
            url: 'https://example.com',
            domain: 'example.com',
            comments: [],
            comments_count: 10,
            poll: [],
            poll_votes_count: 0,
            deleted: false,
            dead: false,
        },
        {
            id: 2,
            title: 'Test Story 2',
            points: 50,
            user: 'testuser2',
            time: 1234567891,
            time_ago: 1234567891,
            type: 'story',
            url: 'https://example2.com',
            domain: 'example2.com',
            comments: [],
            comments_count: 5,
            poll: [],
            poll_votes_count: 0,
            deleted: false,
            dead: false,
        },
    ];

    beforeEach(async () => {
        paramsSubject = new Subject();
        dataSubject = new Subject();

        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: dataSubject.asObservable(),
                        params: paramsSubject.asObservable(),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default errorMessage as empty string', () => {
        expect(component.errorMessage).toBe('');
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            spyOn(window, 'scrollTo');
            fixture.detectChanges();
        });

        it('should subscribe to route data for feedType', () => {
            dataSubject.next({ feedType: 'news' });
            expect(component.feedType).toBe('news');
        });

        it('should set pageNum to 1 when no page param is provided', () => {
            dataSubject.next({ feedType: 'news' });
            paramsSubject.next({});
            expect(component.pageNum).toBe(1);
        });

        it('should set pageNum from route params', () => {
            dataSubject.next({ feedType: 'news' });
            paramsSubject.next({ page: '2' });
            expect(component.pageNum).toBe(2);
        });

        it('should fetch feed with correct parameters', () => {
            dataSubject.next({ feedType: 'news' });
            paramsSubject.next({ page: '1' });
            expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 1);
        });

        it('should set items when feed is fetched successfully', () => {
            dataSubject.next({ feedType: 'news' });
            paramsSubject.next({ page: '1' });
            expect(component.items).toEqual(mockStories);
        });

        it('should calculate listStart correctly for page 1', () => {
            dataSubject.next({ feedType: 'news' });
            paramsSubject.next({ page: '1' });
            expect(component.listStart).toBe(1);
        });

        it('should calculate listStart correctly for page 2', () => {
            dataSubject.next({ feedType: 'news' });
            paramsSubject.next({ page: '2' });
            expect(component.listStart).toBe(31);
        });

        it('should scroll to top after fetching feed', () => {
            dataSubject.next({ feedType: 'news' });
            paramsSubject.next({ page: '1' });
            expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        });
    });

    describe('error handling', () => {
        it('should set errorMessage when feed fetch fails', () => {
            mockHackerNewsAPIService.fetchFeed.and.returnValue(
                new Subject().asObservable()
            );

            fixture.detectChanges();
            dataSubject.next({ feedType: 'news' });

            const errorSubject = new Subject<Story[]>();
            mockHackerNewsAPIService.fetchFeed.and.returnValue(errorSubject.asObservable());

            paramsSubject.next({ page: '1' });
            errorSubject.error(new Error('Network error'));

            expect(component.errorMessage).toBe('Could not load news stories.');
        });
    });
});
