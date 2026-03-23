import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
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
    let mockHNService: any;
    let paramsSubject: Subject<any>;
    let dataSubject: Subject<any>;

    beforeEach(async(() => {
        paramsSubject = new Subject();
        dataSubject = new Subject();
        mockHNService = {
            fetchFeed: jasmine.createSpy('fetchFeed'),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [FeedComponent, MockItemComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        data: dataSubject.asObservable(),
                        params: paramsSubject.asObservable(),
                    },
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set feedType from route data', () => {
        const mockStories: Story[] = [];
        mockHNService.fetchFeed.and.returnValue(of(mockStories));

        fixture.detectChanges();
        dataSubject.next({ feedType: 'news' });

        expect(component.feedType).toBe('news');
    });

    it('should fetch feed items on init with page number', () => {
        const mockStories = [{ id: 1, title: 'Test' }] as Story[];
        mockHNService.fetchFeed.and.returnValue(of(mockStories));

        fixture.detectChanges();
        dataSubject.next({ feedType: 'news' });
        paramsSubject.next({ page: '2' });

        expect(component.pageNum).toBe(2);
        expect(mockHNService.fetchFeed).toHaveBeenCalledWith('news', 2);
        expect(component.items).toEqual(mockStories);
    });

    it('should default to page 1 if no page param', () => {
        const mockStories = [{ id: 1, title: 'Test' }] as Story[];
        mockHNService.fetchFeed.and.returnValue(of(mockStories));

        fixture.detectChanges();
        dataSubject.next({ feedType: 'show' });
        paramsSubject.next({});

        expect(component.pageNum).toBe(1);
    });

    it('should calculate listStart correctly', () => {
        const mockStories = [{ id: 1, title: 'Test' }] as Story[];
        mockHNService.fetchFeed.and.returnValue(of(mockStories));
        spyOn(window, 'scrollTo');

        fixture.detectChanges();
        dataSubject.next({ feedType: 'news' });
        paramsSubject.next({ page: '3' });

        expect(component.listStart).toBe(61);
    });

    it('should set error message on fetch error', () => {
        mockHNService.fetchFeed.and.returnValue(throwError('error'));

        fixture.detectChanges();
        dataSubject.next({ feedType: 'ask' });
        paramsSubject.next({ page: '1' });

        expect(component.errorMessage).toBe('Could not load ask stories.');
    });

    it('should scroll to top on complete', () => {
        const mockStories = [{ id: 1, title: 'Test' }] as Story[];
        mockHNService.fetchFeed.and.returnValue(of(mockStories));
        spyOn(window, 'scrollTo');

        fixture.detectChanges();
        dataSubject.next({ feedType: 'news' });
        paramsSubject.next({ page: '1' });

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should initialize with empty errorMessage', () => {
        expect(component.errorMessage).toBe('');
    });
});
