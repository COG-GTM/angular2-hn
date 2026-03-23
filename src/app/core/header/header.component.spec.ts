import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

@Component({ selector: 'app-settings', template: '' })
class MockSettingsComponent {}

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
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
            imports: [RouterTestingModule],
            declarations: [HeaderComponent, MockSettingsComponent],
            providers: [{ provide: SettingsService, useValue: mockSettingsService }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBeDefined();
        expect(component.settings.theme).toBe('default');
    });

    it('should call toggleSettings on SettingsService', () => {
        component.toggleSettings();
        expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
    });

    it('should call window.scrollTo on scrollTop', () => {
        spyOn(window, 'scrollTo');
        component.scrollTop();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});
