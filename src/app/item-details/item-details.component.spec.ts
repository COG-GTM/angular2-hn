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
    let mockSettings: Settings;

    const mockStory: Story = {
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
    };

    beforeEach(async () => {
        paramsSubject = new Subject();

        mockSettings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0'
        };

        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
        mockHackerNewsAPIService.fetchItemContent.and.returnValue(of(mockStory));

        mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings'], {
            settings: mockSettings
        });

        mockLocation = jasmine.createSpyObj('Location', ['back']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [ItemDetailsComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: Location, useValue: mockLocation },
                { provide: ActivatedRoute, useValue: { params: paramsSubject.asObservable() } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ItemDetailsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default error message as empty string', () => {
        expect(component.errorMessage).toBe('');
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBe(mockSettings);
    });

    it('should fetch item content on init', () => {
        component.ngOnInit();
        paramsSubject.next({ id: '123' });
        expect(mockHackerNewsAPIService.fetchItemContent).toHaveBeenCalledWith(123);
    });

    it('should set item when fetched successfully', () => {
        component.ngOnInit();
        paramsSubject.next({ id: '123' });
        expect(component.item).toEqual(mockStory);
    });

    describe('goBack', () => {
        it('should call location.back()', () => {
            component.goBack();
            expect(mockLocation.back).toHaveBeenCalled();
        });
    });

    describe('hasUrl', () => {
        it('should return true when url starts with http', () => {
            component.item = { ...mockStory, url: 'https://example.com' };
            expect(component.hasUrl).toBe(true);
        });

        it('should return false when url does not start with http', () => {
            component.item = { ...mockStory, url: 'item?id=123' };
            expect(component.hasUrl).toBe(false);
        });
    });
});
