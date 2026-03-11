import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
    let component: ItemComponent;
    let fixture: ComponentFixture<ItemComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;

    const mockItem: Story = {
        id: 1,
        title: 'Test Story',
        points: 100,
        user: 'testuser',
        time: 1234567890,
        time_ago: 1234567890 as any,
        type: 'story',
        url: 'http://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };

    beforeEach(async(() => {
        mockSettingsService = jasmine.createSpyObj('SettingsService', ['toggleSettings']);
        mockSettingsService.settings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
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
        component.item = mockItem;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toEqual(mockSettingsService.settings);
    });

    it('should return true for hasUrl when url starts with http', () => {
        component.item = { ...mockItem, url: 'http://example.com' };
        expect(component.hasUrl).toBe(true);
    });

    it('should return true for hasUrl when url starts with https', () => {
        component.item = { ...mockItem, url: 'https://example.com' };
        expect(component.hasUrl).toBe(true);
    });

    it('should return false for hasUrl when url does not start with http', () => {
        component.item = { ...mockItem, url: 'item?id=123' };
        expect(component.hasUrl).toBe(false);
    });

    it('should render the title', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.title').textContent).toContain('Test Story');
    });

    it('should render domain when present', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.domain').textContent).toContain('example.com');
    });

    it('should render user name', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.name a').textContent).toContain('testuser');
    });

    it('should render points', () => {
        const compiled = fixture.nativeElement;
        const text = compiled.textContent;
        expect(text).toContain('100');
    });

    it('should not show user details for job type', () => {
        component.item = { ...mockItem, type: 'job' };
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const palmDetails = compiled.querySelector('.subtext-palm .details .name');
        expect(palmDetails).toBeFalsy();
    });

    it('should apply listSpacing style', () => {
        const compiled = fixture.nativeElement;
        const wrapper = compiled.querySelector('div');
        expect(wrapper.style.marginBottom).toBe('0px');
    });

    it('should apply titleFontSize style', () => {
        const compiled = fixture.nativeElement;
        const titleLink = compiled.querySelector('.title');
        expect(titleLink.style.fontSize).toBe('16px');
    });
});
