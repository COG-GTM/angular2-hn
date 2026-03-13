import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { Component, Input } from '@angular/core';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';
import { PipesModule } from '../shared/pipes/pipes.module';

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
    story.poll = [];
    story.poll_votes_count = 0;
    story.deleted = false;
    story.dead = false;
    Object.assign(story, overrides);
    return story;
}

describe('ItemDetailsComponent', () => {
    let component: ItemDetailsComponent;
    let fixture: ComponentFixture<ItemDetailsComponent>;
    let mockHNService: any;
    let mockSettingsService: any;
    let mockLocation: any;
    let mockItem: Story;

    beforeEach(async(() => {
        mockItem = createMockStory();
        mockHNService = {
            fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(of(mockItem))
        };

        mockSettingsService = {
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0'
            },
            toggleSettings: jasmine.createSpy('toggleSettings')
        };

        mockLocation = {
            back: jasmine.createSpy('back')
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [
                ItemDetailsComponent,
                MockLoaderComponent,
                MockErrorMessageComponent,
                MockCommentComponent
            ],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: '1' })
                    }
                }
            ]
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
        expect(mockHNService.fetchItemContent).toHaveBeenCalledWith(1);
    });

    it('should set item after fetching', () => {
        expect(component.item).toEqual(mockItem);
    });

    it('should scroll to top on init', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should call location.back on goBack', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should return true for hasUrl when url starts with http', () => {
        component.item = createMockStory({ url: 'https://example.com' });
        expect(component.hasUrl).toBe(true);
    });

    it('should return false for hasUrl when url does not start with http', () => {
        component.item = createMockStory({ url: 'item?id=123' });
        expect(component.hasUrl).toBe(false);
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBeDefined();
        expect(component.settings.theme).toBe('default');
    });

    it('should have empty errorMessage initially', () => {
        expect(component.errorMessage).toBe('');
    });

    it('should set errorMessage on fetch error', () => {
        mockHNService.fetchItemContent.and.returnValue(throwError('error'));

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [
                ItemDetailsComponent,
                MockLoaderComponent,
                MockErrorMessageComponent,
                MockCommentComponent
            ],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: '1' })
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ItemDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.errorMessage).toBe('Could not load item comments.');
    });

    it('should render item title when item is loaded', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.title').textContent).toContain('Test Story');
    });

    it('should render back button', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.back-button')).toBeTruthy();
    });

    it('should render comment list', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.comment-list')).toBeTruthy();
    });
});
