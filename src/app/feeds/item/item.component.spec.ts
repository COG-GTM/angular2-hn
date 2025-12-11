import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
    let component: ItemComponent;
    let fixture: ComponentFixture<ItemComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;

    const mockSettings: Settings = {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
    };

    const mockStory: Story = {
        id: 1,
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
        mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings'], {
            settings: mockSettings,
        });

        await TestBed.configureTestingModule({
            declarations: [ItemComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ItemComponent);
        component = fixture.componentInstance;
        component.item = mockStory;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBe(mockSettings);
    });

    it('should accept item input', () => {
        expect(component.item).toBe(mockStory);
    });

    describe('hasUrl', () => {
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

        it('should return false for empty url', () => {
            component.item = { ...mockStory, url: '' };
            expect(component.hasUrl).toBe(false);
        });
    });

    it('should call ngOnInit', () => {
        spyOn(component, 'ngOnInit');
        component.ngOnInit();
        expect(component.ngOnInit).toHaveBeenCalled();
    });
});
