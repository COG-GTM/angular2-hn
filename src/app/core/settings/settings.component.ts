import { Component } from '@angular/core';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  settings: Settings;

  constructor(private _settingsService: SettingsService) {
    this.settings = this._settingsService.settings;
  }

  closeSettings(): void {
    this._settingsService.toggleSettings();
  }

  toggleOpenLinksInNewTab(): void {
    this._settingsService.toggleOpenLinksInNewTab();
  }

  selectTheme(theme: string): void {
    this._settingsService.setTheme(theme);
  }

  changeTitleFont(val: string): void {
    this._settingsService.setFont(val);
  }

  changeSpacing(val: string): void {
    this._settingsService.setSpacing(val);
  }
}
