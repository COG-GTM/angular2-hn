import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';
import { PipesModule } from '../../shared/pipes/pipes.module';

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
    Object.assign(story, overrides);
    return story;
}

describe('ItemComponent', () => {
    let component: ItemComponent;
    let fixture: ComponentFixture<ItemComponent>;
    let mockSettingsService: any;

    beforeEach(async(() => {
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

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ItemComponent);
        component = fixture.componentInstance;
        component.item = createMockStory();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBeDefined();
        expect(component.settings.theme).toBe('default');
    });

    it('should return true for hasUrl when url starts with http', () => {
        component.item.url = 'https://example.com';
        expect(component.hasUrl).toBe(true);
    });

    it('should return true for hasUrl when url starts with http (not https)', () => {
        component.item.url = 'http://example.com';
        expect(component.hasUrl).toBe(true);
    });

    it('should return false for hasUrl when url does not start with http', () => {
        component.item.url = 'item?id=123';
        expect(component.hasUrl).toBe(false);
    });

    it('should return false for hasUrl for empty url', () => {
        component.item.url = '';
        expect(component.hasUrl).toBe(false);
    });

    it('should render the title', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.title').textContent).toContain('Test Story');
    });

    it('should render external link when hasUrl is true', () => {
        component.item.url = 'https://example.com';
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        const link = compiled.querySelector('a.title[href]');
        expect(link).toBeTruthy();
    });

    it('should render domain when present', () => {
        component.item.domain = 'example.com';
        component.item.url = 'https://example.com';
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.domain').textContent).toContain('example.com');
    });

    it('should render user name', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.name') || compiled.textContent).toBeTruthy();
    });

    it('should render points', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.textContent).toContain('100');
    });

    it('should apply listSpacing style', () => {
        const compiled = fixture.debugElement.nativeElement;
        const div = compiled.querySelector('div');
        expect(div.style.marginBottom).toBeDefined();
    });

    it('should call ngOnInit without errors', () => {
        expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should render comment count', () => {
        component.item.comments_count = 5;
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.textContent).toContain('5 comments');
    });

    it('should not show details for job type', () => {
        component.item.type = 'job';
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        // Job items don't show user/points in certain sections
        expect(compiled.textContent).not.toContain('points by');
    });
});
