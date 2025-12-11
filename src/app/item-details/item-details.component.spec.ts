import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, Subject } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';
import { Settings } from '../shared/models/settings';

describe('ItemDetailsComponent', () => {
    let component: ItemDetailsComponent;
    let fixture: ComponentFixture<ItemDetailsComponent>;
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;
    let mockLocation: jasmine.SpyObj<Location>;
    let paramsSubject: Subject<any>;

    const mockSettings: Settings = {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
    };

    const mockStory: Story = {
        id: 12345,
        title: 'Test Story',
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
    };

    beforeEach(async () => {
        paramsSubject = new Subject();

        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
        mockHackerNewsAPIService.fetchItemContent.and.returnValue(of(mockStory));

        mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings'], {
            settings: mockSettings,
        });

        mockLocation = jasmine.createSpyObj('Location', ['back']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [ItemDetailsComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: paramsSubject.asObservable(),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ItemDetailsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBe(mockSettings);
    });

    it('should have default errorMessage as empty string', () => {
        expect(component.errorMessage).toBe('');
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            spyOn(window, 'scrollTo');
            fixture.detectChanges();
        });

        it('should fetch item content when route params change', () => {
            paramsSubject.next({ id: '12345' });
            expect(mockHackerNewsAPIService.fetchItemContent).toHaveBeenCalledWith(12345);
        });

        it('should set item when fetch is successful', () => {
            paramsSubject.next({ id: '12345' });
            expect(component.item).toEqual(mockStory);
        });

        it('should scroll to top on init', () => {
            expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        });
    });

    describe('goBack', () => {
        it('should call location.back', () => {
            component.goBack();
            expect(mockLocation.back).toHaveBeenCalled();
        });
    });

    describe('hasUrl', () => {
        beforeEach(() => {
            component.item = mockStory;
        });

        it('should return true when url starts with http', () => {
            component.item = { ...mockStory, url: 'http://example.com' };
            expect(component.hasUrl).toBe(true);
        });

        it('should return true when url starts with https', () => {
            component.item = { ...mockStory, url: 'https://example.com' };
            expect(component.hasUrl).toBe(true);
        });

        it('should return false when url does not start with http', () => {
            component.item = { ...mockStory, url: 'item?id=12345' };
            expect(component.hasUrl).toBe(false);
        });
    });

    describe('error handling', () => {
        it('should set errorMessage when fetch fails', () => {
            const errorSubject = new Subject<Story>();
            mockHackerNewsAPIService.fetchItemContent.and.returnValue(errorSubject.asObservable());

            spyOn(window, 'scrollTo');
            fixture.detectChanges();
            paramsSubject.next({ id: '12345' });
            errorSubject.error(new Error('Network error'));

            expect(component.errorMessage).toBe('Could not load item comments.');
        });
    });
});
