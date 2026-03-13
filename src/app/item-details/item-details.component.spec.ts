import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
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
    let mockHackerNewsService: any;
    let mockSettingsService: any;
    let mockLocation: any;

    const mockItem: Story = {
        id: 123,
        title: 'Test Item',
        points: 200,
        user: 'testuser',
        time: 1234567890,
        time_ago: 1,
        type: 'story',
        url: 'http://example.com',
        domain: 'example.com',
        comments: [
            {
                id: 1,
                level: 0,
                user: 'commenter',
                time: 1234567890,
                time_ago: '2 hours ago',
                content: 'Great post!',
                deleted: false,
                comments: [],
            },
        ],
        comments_count: 1,
        content: '<p>Some content</p>',
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    } as Story;

    beforeEach(() => {
        mockHackerNewsService = {
            fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(of(mockItem)),
        };

        mockSettingsService = {
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            },
            toggleSettings: jasmine.createSpy('toggleSettings'),
        };

        mockLocation = {
            back: jasmine.createSpy('back'),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemDetailsComponent, MockCommentComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: '123' }),
                    },
                },
            ],
        }).compileComponents();

        spyOn(window, 'scrollTo');

        fixture = TestBed.createComponent(ItemDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch item content on init', () => {
        expect(mockHackerNewsService.fetchItemContent).toHaveBeenCalledWith(123);
    });

    it('should set the item after fetch', () => {
        expect(component.item).toEqual(mockItem);
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBeTruthy();
        expect(component.settings.theme).toBe('default');
    });

    it('should call window.scrollTo on init', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should navigate back when goBack is called', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    describe('hasUrl', () => {
        it('should return true when url starts with http', () => {
            expect(component.hasUrl).toBe(true);
        });

        it('should return false when url does not start with http', () => {
            component.item = { ...mockItem, url: '' } as Story;
            expect(component.hasUrl).toBe(false);
        });
    });

    it('should render the item title', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.textContent).toContain('Test Item');
    });

    it('should render the back button', () => {
        const compiled = fixture.nativeElement;
        const backBtn = compiled.querySelector('.back-button');
        expect(backBtn).toBeTruthy();
    });

    it('should render comments', () => {
        const compiled = fixture.nativeElement;
        const commentElements = compiled.querySelectorAll('app-comment');
        expect(commentElements.length).toBe(1);
    });
});

describe('ItemDetailsComponent with error', () => {
    let component: ItemDetailsComponent;
    let fixture: ComponentFixture<ItemDetailsComponent>;
    let mockHackerNewsService: any;
    let mockSettingsService: any;
    let mockLocation: any;

    beforeEach(() => {
        mockHackerNewsService = {
            fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(throwError('error')),
        };

        mockSettingsService = {
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            },
            toggleSettings: jasmine.createSpy('toggleSettings'),
        };

        mockLocation = {
            back: jasmine.createSpy('back'),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemDetailsComponent, MockCommentComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: '456' }),
                    },
                },
            ],
        }).compileComponents();

        spyOn(window, 'scrollTo');

        fixture = TestBed.createComponent(ItemDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should set errorMessage on error', () => {
        expect(component.errorMessage).toBe('Could not load item comments.');
    });

    it('should not have item on error', () => {
        expect(component.item).toBeUndefined();
    });
});
