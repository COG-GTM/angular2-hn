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
    let mockActivatedRoute: any;
    let paramsSubject: Subject<any>;
    let dataSubject: Subject<any>;

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
            comments_count: 10,
            poll: [],
            poll_votes_count: 0,
            deleted: false,
            dead: false
        }
    ];

    beforeEach(async () => {
        paramsSubject = new Subject();
        dataSubject = new Subject();

        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
        mockHackerNewsAPIService.fetchFeed.and.returnValue(of(mockStories));

        mockActivatedRoute = {
            params: paramsSubject.asObservable(),
            data: dataSubject.asObservable()
        };

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default error message as empty string', () => {
        expect(component.errorMessage).toBe('');
    });

    it('should subscribe to route data on init', () => {
        component.ngOnInit();
        dataSubject.next({ feedType: 'news' });
        expect(component.feedType).toBe('news');
    });

    it('should fetch feed when params change', () => {
        component.ngOnInit();
        dataSubject.next({ feedType: 'news' });
        paramsSubject.next({ page: '1' });
        expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 1);
    });

    it('should default to page 1 when no page param', () => {
        component.ngOnInit();
        dataSubject.next({ feedType: 'news' });
        paramsSubject.next({});
        expect(component.pageNum).toBe(1);
    });

    it('should set items when feed is fetched successfully', () => {
        component.ngOnInit();
        dataSubject.next({ feedType: 'news' });
        paramsSubject.next({ page: '1' });
        expect(component.items).toEqual(mockStories);
    });

    it('should calculate listStart correctly', () => {
        component.ngOnInit();
        dataSubject.next({ feedType: 'news' });
        paramsSubject.next({ page: '2' });
        expect(component.listStart).toBe(31);
    });
});
