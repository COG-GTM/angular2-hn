import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
    let component: ItemComponent;
    let fixture: ComponentFixture<ItemComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;
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
        mockSettings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0'
        };

        mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings'], {
            settings: mockSettings
        });

        await TestBed.configureTestingModule({
            declarations: [ItemComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ItemComponent);
        component = fixture.componentInstance;
        component.item = mockStory;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBe(mockSettings);
    });

    describe('hasUrl', () => {
        it('should return true when url starts with http', () => {
            component.item = { ...mockStory, url: 'https://example.com' };
            expect(component.hasUrl).toBe(true);
        });

        it('should return true when url starts with http (not https)', () => {
            component.item = { ...mockStory, url: 'http://example.com' };
            expect(component.hasUrl).toBe(true);
        });

        it('should return false when url does not start with http', () => {
            component.item = { ...mockStory, url: 'item?id=123' };
            expect(component.hasUrl).toBe(false);
        });

        it('should return false for empty url', () => {
            component.item = { ...mockStory, url: '' };
            expect(component.hasUrl).toBe(false);
        });
    });

    it('should call ngOnInit without errors', () => {
        expect(() => component.ngOnInit()).not.toThrow();
    });
});
