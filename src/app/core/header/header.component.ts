import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { SettingsService } from '../../shared/services/settings.service';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, SettingsComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private readonly settingsService = inject(SettingsService);
  readonly settings = this.settingsService.settings;

  toggleSettings() {
    this.settingsService.toggleSettings();
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }
}
