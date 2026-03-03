import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';
import { Component, Input } from '@angular/core';
import { Comment } from '../shared/models/comment';
import { PipesModule } from '../shared/pipes/pipes.module';

@Component({ selector: 'app-comment', template: '' })
class MockCommentComponent {
    @Input() comment: Comment;
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
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockLocation: jasmine.SpyObj<Location>;

    const mockStory: Story = {
        id: 123,
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
    } as Story;

    beforeEach(async(() => {
        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
        mockHackerNewsAPIService.fetchItemContent.and.returnValue(of(mockStory));
        mockLocation = jasmine.createSpyObj('Location', ['back']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemDetailsComponent, MockCommentComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                SettingsService,
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: '123' }),
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
        expect(mockHackerNewsAPIService.fetchItemContent).toHaveBeenCalledWith(123);
    });

    it('should set item after fetching', () => {
        expect(component.item).toEqual(mockStory);
    });

    it('should call location.back() on goBack', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should return true for hasUrl when url starts with http', () => {
        component.item = { ...mockStory, url: 'https://example.com' } as Story;
        expect(component.hasUrl).toBe(true);
    });

    it('should return false for hasUrl when url does not start with http', () => {
        component.item = { ...mockStory, url: '' } as Story;
        expect(component.hasUrl).toBe(false);
    });

    it('should scroll to top on init', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});
