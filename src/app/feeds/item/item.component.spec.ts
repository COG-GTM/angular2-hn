import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';
import { PipesModule } from '../../shared/pipes/pipes.module';

describe('ItemComponent', () => {
    let component: ItemComponent;
    let fixture: ComponentFixture<ItemComponent>;
    let settingsService: SettingsService;

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
    } as Story;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemComponent],
            providers: [SettingsService],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ItemComponent);
        component = fixture.componentInstance;
        settingsService = TestBed.inject(SettingsService);
        component.item = mockStory;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBe(settingsService.settings);
    });

    it('should return true for hasUrl when url starts with http', () => {
        component.item = { ...mockStory, url: 'https://example.com' } as Story;
        expect(component.hasUrl).toBe(true);
    });

    it('should return false for hasUrl when url does not start with http', () => {
        component.item = { ...mockStory, url: '' } as Story;
        expect(component.hasUrl).toBe(false);
    });

    it('should return true for hasUrl when url starts with http (not https)', () => {
        component.item = { ...mockStory, url: 'http://example.com' } as Story;
        expect(component.hasUrl).toBe(true);
    });
});
