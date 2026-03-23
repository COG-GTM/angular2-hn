import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
    let component: ItemComponent;
    let fixture: ComponentFixture<ItemComponent>;
    let mockSettingsService: any;

    beforeEach(async(() => {
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

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ItemComponent);
        component = fixture.componentInstance;
        component.item = {
            id: 1,
            title: 'Test Story',
            points: 100,
            user: 'testuser',
            time: 1234567890,
            time_ago: 3,
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
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBeDefined();
        expect(component.settings.theme).toBe('default');
    });

    it('should return true for hasUrl when item has http url', () => {
        component.item.url = 'https://example.com';
        expect(component.hasUrl).toBe(true);
    });

    it('should return true for hasUrl when item has http (non-https) url', () => {
        component.item.url = 'http://example.com';
        expect(component.hasUrl).toBe(true);
    });

    it('should return false for hasUrl when item has no http url', () => {
        component.item.url = '';
        expect(component.hasUrl).toBe(false);
    });

    it('should return false for hasUrl when url is internal', () => {
        component.item.url = 'item?id=123';
        expect(component.hasUrl).toBe(false);
    });

    it('should accept item as input', () => {
        expect(component.item).toBeDefined();
        expect(component.item.title).toBe('Test Story');
    });
});
