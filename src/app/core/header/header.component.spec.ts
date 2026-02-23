import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsComponent } from '../settings/settings.component';
import { CommonModule } from '@angular/common';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let settingsService: SettingsService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, CommonModule],
            declarations: [HeaderComponent, SettingsComponent],
            providers: [SettingsService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        settingsService = TestBed.inject(SettingsService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have settings from SettingsService', () => {
        expect(component.settings).toBeTruthy();
        expect(component.settings).toBe(settingsService.settings);
    });

    it('should toggle settings when toggleSettings is called', () => {
        const initialValue = component.settings.showSettings;
        component.toggleSettings();
        expect(component.settings.showSettings).toBe(!initialValue);
    });

    it('should call window.scrollTo when scrollTop is called', () => {
        spyOn(window, 'scrollTo');
        component.scrollTop();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});
