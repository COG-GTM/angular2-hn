import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';
import { Component, Input } from '@angular/core';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { PipesModule } from '../shared/pipes/pipes.module';
import { Story } from '../shared/models/story';

@Component({ selector: 'app-comment', template: '' })
class MockCommentComponent {
    @Input() comment: any;
}

@Component({ selector: 'app-loader', template: '' })
class MockLoaderComponent {}

@Component({ selector: 'app-error-message', template: '' })
class MockErrorMessageComponent {
    @Input() message: string;
}

describe('ItemDetailsComponent', () => {
    let component: ItemDetailsComponent;
    let fixture: ComponentFixture<ItemDetailsComponent>;
    let mockHNService: any;
    let mockSettingsService: any;
    let mockLocation: any;
    let paramsSubject: Subject<any>;

    beforeEach(async(() => {
        paramsSubject = new Subject();
        mockHNService = {
            fetchItemContent: jasmine.createSpy('fetchItemContent'),
        };
        mockSettingsService = {
            toggleSettings: jasmine.createSpy('toggleSettings'),
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            },
        };
        mockLocation = {
            back: jasmine.createSpy('back'),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemDetailsComponent, MockCommentComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
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
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ItemDetailsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBeDefined();
        expect(component.settings.theme).toBe('default');
    });

    it('should fetch item content on init', () => {
        const mockStory = {
            id: 1,
            title: 'Test',
            type: 'story',
            url: 'https://example.com',
            comments: [],
            comments_count: 0,
        } as any as Story;
        mockHNService.fetchItemContent.and.returnValue(of(mockStory));
        spyOn(window, 'scrollTo');

        fixture.detectChanges();
        paramsSubject.next({ id: '1' });

        expect(mockHNService.fetchItemContent).toHaveBeenCalledWith(1);
        expect(component.item).toEqual(mockStory);
    });

    it('should set error message on fetch error', () => {
        mockHNService.fetchItemContent.and.returnValue(throwError('error'));
        spyOn(window, 'scrollTo');

        fixture.detectChanges();
        paramsSubject.next({ id: '1' });

        expect(component.errorMessage).toBe('Could not load item comments.');
    });

    it('should call location.back on goBack', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should return true for hasUrl when item url starts with http', () => {
        component.item = { url: 'https://example.com' } as Story;
        expect(component.hasUrl).toBe(true);
    });

    it('should return false for hasUrl when item url does not start with http', () => {
        component.item = { url: 'item?id=123' } as Story;
        expect(component.hasUrl).toBe(false);
    });

    it('should scroll to top on init', () => {
        mockHNService.fetchItemContent.and.returnValue(of({} as Story));
        spyOn(window, 'scrollTo');

        fixture.detectChanges();

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should initialize with empty errorMessage', () => {
        expect(component.errorMessage).toBe('');
    });
});
