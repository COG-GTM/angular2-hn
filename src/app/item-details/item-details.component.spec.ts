import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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

@Component({ selector: 'app-loader', template: '' })
class MockLoaderComponent {}

@Component({ selector: 'app-error-message', template: '' })
class MockErrorMessageComponent {
    @Input() message: string;
}

@Component({ selector: 'app-comment', template: '' })
class MockCommentComponent {
    @Input() comment: any;
}

describe('ItemDetailsComponent', () => {
    let component: ItemDetailsComponent;
    let fixture: ComponentFixture<ItemDetailsComponent>;
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;
    let mockLocation: jasmine.SpyObj<Location>;

    const mockStory: Story = {
        id: 1,
        title: 'Test Story',
        points: 100,
        user: 'testuser',
        time: 1234567890,
        time_ago: 1234567890 as any,
        type: 'story',
        url: 'http://example.com',
        domain: 'example.com',
        comments: [
            {
                id: 10,
                level: 0,
                user: 'commenter',
                time: 1234567890,
                time_ago: '2 hours ago',
                content: '<p>Great post!</p>',
                deleted: false,
                comments: [],
            },
        ],
        comments_count: 1,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };

    beforeEach(async(() => {
        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
        mockHackerNewsAPIService.fetchItemContent.and.returnValue(of(mockStory));

        mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings']);
        mockSettingsService.settings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        };

        mockLocation = jasmine.createSpyObj('Location', ['back']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemDetailsComponent, MockLoaderComponent, MockErrorMessageComponent, MockCommentComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: '1' }),
                    },
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        spyOn(window, 'scrollTo');
        fixture = TestBed.createComponent(ItemDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch item content on init', () => {
        expect(mockHackerNewsAPIService.fetchItemContent).toHaveBeenCalledWith(1);
    });

    it('should set item from API response', () => {
        expect(component.item).toEqual(mockStory);
    });

    it('should call window.scrollTo on init', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should navigate back on goBack', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should return true for hasUrl when url starts with http', () => {
        expect(component.hasUrl).toBe(true);
    });

    it('should return false for hasUrl when url does not start with http', () => {
        component.item = { ...mockStory, url: 'item?id=123' };
        expect(component.hasUrl).toBe(false);
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toEqual(mockSettingsService.settings);
    });

    it('should set errorMessage on API error', () => {
        mockHackerNewsAPIService.fetchItemContent.and.returnValue(throwError('error'));

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemDetailsComponent, MockLoaderComponent, MockErrorMessageComponent, MockCommentComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: '1' }),
                    },
                },
            ],
        }).compileComponents();

        const errorFixture = TestBed.createComponent(ItemDetailsComponent);
        const errorComponent = errorFixture.componentInstance;
        errorFixture.detectChanges();

        expect(errorComponent.errorMessage).toBe('Could not load item comments.');
    });

    it('should render the title when item is loaded', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.title').textContent).toContain('Test Story');
    });

    it('should render comments', () => {
        const compiled = fixture.nativeElement;
        const commentElements = compiled.querySelectorAll('app-comment');
        expect(commentElements.length).toBe(1);
    });
});
