import { Component, inject } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
})
export class SettingsComponent {
    private readonly settingsService = inject(SettingsService);
    readonly settings = this.settingsService.settings;
    readonly themes = [
        { value: 'default', label: 'Default' },
        { value: 'night', label: 'Night' },
        { value: 'amoledblack', label: 'Black (AMOLED)' },
    ];

    closeSettings(): void {
        this.settingsService.toggleSettings();
    }

    toggleOpenLinksInNewTab(): void {
        this.settingsService.toggleOpenLinksInNewTab();
    }

    selectTheme(theme: string): void {
        this.settingsService.setTheme(theme);
    }

    changeTitleFont(value: string): void {
        this.settingsService.setFont(value);
    }

    changeSpacing(value: string): void {
        this.settingsService.setSpacing(value);
    }
}
