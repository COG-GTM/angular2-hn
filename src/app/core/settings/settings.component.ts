import { Component, inject } from '@angular/core';

import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);

  settings: Settings = this.settingsService.settings;

  closeSettings() {
    this.settingsService.toggleSettings();
  }

  toggleOpenLinksInNewTab() {
    this.settingsService.toggleOpenLinksInNewTab();
  }

  selectTheme(theme: string) {
    this.settingsService.setTheme(theme);
  }

  changeTitleFont(fontSize: string) {
    this.settingsService.setFont(fontSize);
  }

  changeSpacing(listSpacing: string) {
    this.settingsService.setSpacing(listSpacing);
  }
}
