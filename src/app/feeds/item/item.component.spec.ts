import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
    let component: ItemComponent;
    let fixture: ComponentFixture<ItemComponent>;
    let mockSettingsService: any;

    const mockStory: Story = {
        id: 1,
        title: 'Test Story Title',
        points: 100,
        user: 'testuser',
        time: 1234567890,
        time_ago: 1,
        type: 'story',
        url: 'http://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    } as Story;

    beforeEach(() => {
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

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
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
        expect(component.settings).toBeTruthy();
        expect(component.settings.theme).toBe('default');
    });

    it('should have the input item', () => {
        expect(component.item).toEqual(mockStory);
    });

    describe('hasUrl', () => {
        it('should return true when url starts with http', () => {
            component.item = { ...mockStory, url: 'http://example.com' } as Story;
            expect(component.hasUrl).toBe(true);
        });

        it('should return true when url starts with https', () => {
            component.item = { ...mockStory, url: 'https://example.com' } as Story;
            expect(component.hasUrl).toBe(true);
        });

        it('should return false when url does not start with http', () => {
            component.item = { ...mockStory, url: 'item?id=123' } as Story;
            expect(component.hasUrl).toBe(false);
        });

        it('should return false for empty url', () => {
            component.item = { ...mockStory, url: '' } as Story;
            expect(component.hasUrl).toBe(false);
        });
    });

    it('should render the title', () => {
        const compiled = fixture.nativeElement;
        const title = compiled.querySelector('.title');
        expect(title.textContent).toContain('Test Story Title');
    });

    it('should render external link for items with URL', () => {
        const compiled = fixture.nativeElement;
        const link = compiled.querySelector('a.title');
        expect(link.href).toContain('example.com');
    });

    it('should render the domain', () => {
        const compiled = fixture.nativeElement;
        const domain = compiled.querySelector('.domain');
        expect(domain.textContent).toContain('example.com');
    });

    it('should render points for non-job items', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.textContent).toContain('100');
    });

    it('should render the user link', () => {
        const compiled = fixture.nativeElement;
        const userLinks = compiled.querySelectorAll('a[href*="user"]');
        expect(userLinks.length).toBeGreaterThan(0);
    });
});

describe('ItemComponent with job type', () => {
    let component: ItemComponent;
    let fixture: ComponentFixture<ItemComponent>;
    let mockSettingsService: any;

    const mockJob: Story = {
        id: 2,
        title: 'Test Job',
        points: 0,
        user: '',
        time: 1234567890,
        time_ago: 1,
        type: 'job',
        url: 'http://jobs.example.com',
        domain: 'jobs.example.com',
        comments: [],
        comments_count: 0,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    } as Story;

    beforeEach(() => {
        mockSettingsService = {
            settings: {
                showSettings: false,
                openLinkInNewTab: true,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            },
            toggleSettings: jasmine.createSpy('toggleSettings'),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ItemComponent);
        component = fixture.componentInstance;
        component.item = mockJob;
        fixture.detectChanges();
    });

    it('should create with job type', () => {
        expect(component).toBeTruthy();
        expect(component.item.type).toBe('job');
    });

    it('should open links in new tab when setting is enabled', () => {
        expect(component.settings.openLinkInNewTab).toBe(true);
    });
});

describe('ItemComponent without URL', () => {
    let component: ItemComponent;
    let fixture: ComponentFixture<ItemComponent>;
    let mockSettingsService: any;

    const mockStory: Story = {
        id: 3,
        title: 'Ask HN: Test',
        points: 50,
        user: 'testuser',
        time: 1234567890,
        time_ago: 1,
        type: 'story',
        url: '',
        domain: '',
        comments: [],
        comments_count: 10,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    } as Story;

    beforeEach(() => {
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

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ItemComponent);
        component = fixture.componentInstance;
        component.item = mockStory;
        fixture.detectChanges();
    });

    it('should not have url', () => {
        expect(component.hasUrl).toBe(false);
    });

    it('should render internal link for items without URL', () => {
        const compiled = fixture.nativeElement;
        const link = compiled.querySelector('a.title');
        expect(link).toBeTruthy();
    });
});
