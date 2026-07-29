import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';
import { SettingsControlsComponent } from './settings-controls.component';

@Component({
    selector: 'app-settings',
    imports: [SettingsControlsComponent],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
    private readonly settingsService = inject(SettingsService);

    closeSettings(): void {
        this.settingsService.closeSettings();
    }
}
