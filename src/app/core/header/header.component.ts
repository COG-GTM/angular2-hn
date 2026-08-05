import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [RouterLink, RouterLinkActive, NgIf, SettingsComponent],
})
export class HeaderComponent {
  private readonly settingsService = inject(SettingsService);

  settings: Settings = this.settingsService.settings;

  toggleSettings() {
    this.settingsService.toggleSettings();
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }
}
