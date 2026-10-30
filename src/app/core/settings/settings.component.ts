import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);
  readonly settings = this.settingsService.settings;

  closeSettings() {
    this.settingsService.toggleSettings();
  }

  toggleOpenLinksInNewTab() {
    this.settingsService.toggleOpenLinksInNewTab();
  }

  selectTheme(theme: string) {
    this.settingsService.setTheme(theme);
  }

  changeTitleFont(val: string) {
    this.settingsService.setFont(val);
  }

  changeSpacing(val: string) {
    this.settingsService.setSpacing(val);
  }
}
