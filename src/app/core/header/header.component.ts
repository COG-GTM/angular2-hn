import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { SettingsComponent } from '../settings/settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SettingsComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  settings: Settings;

  constructor(private _settingsService: SettingsService) {
    this.settings = this._settingsService.settings;
  }

  toggleSettings(): void {
    this._settingsService.toggleSettings();
  }

  scrollTop(): void {
    window.scrollTo(0, 0);
  }
}
