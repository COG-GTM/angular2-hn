import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Theme } from '../../shared/models/settings';
import { SettingsService } from '../../shared/services/settings.service';

/** Preference controls shared by the settings overlay and the card account page. */
@Component({
    selector: 'app-settings-controls',
    templateUrl: './settings-controls.component.html',
    styleUrl: './settings-controls.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsControlsComponent {
    private readonly settingsService = inject(SettingsService);
    readonly settings = this.settingsService.settings;
    readonly themes: { value: Theme; label: string }[] = [
        { value: 'default', label: 'Default' },
        { value: 'night', label: 'Night' },
        { value: 'amoledblack', label: 'Black (AMOLED)' },
    ];

    toggleMaskAmounts(): void {
        this.settingsService.toggleMaskAmounts();
    }

    selectTheme(theme: Theme): void {
        this.settingsService.setTheme(theme);
    }

    changeTitleFont(value: string): void {
        this.settingsService.setFont(value);
    }

    changeSpacing(value: string): void {
        this.settingsService.setSpacing(value);
    }
}
