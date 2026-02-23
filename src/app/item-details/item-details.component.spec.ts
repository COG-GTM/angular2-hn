import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
    let component: ItemDetailsComponent;
    let fixture: ComponentFixture<ItemDetailsComponent>;
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockLocation: jasmine.SpyObj<Location>;

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
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };

    beforeEach(async () => {
        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
        mockHackerNewsAPIService.fetchItemContent.and.returnValue(of(mockStory));

        mockLocation = jasmine.createSpyObj('Location', ['back']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, CommonModule, SharedComponentsModule, PipesModule],
            declarations: [ItemDetailsComponent, CommentComponent],
            providers: [
                SettingsService,
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: '1' }),
                    },
                },
            ],
        }).compileComponents();
    });

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

    it('should set item after successful fetch', () => {
        expect(component.item).toEqual(mockStory);
    });

    it('should call window.scrollTo on init', () => {
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should call location.back when goBack is called', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should return true for hasUrl when url starts with http', () => {
        expect(component.hasUrl).toBe(true);
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBeTruthy();
    });
});
