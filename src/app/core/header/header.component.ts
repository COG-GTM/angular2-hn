import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  settings: Settings;

  constructor(
    private _settingsService: SettingsService,
    public authService: AuthService,
    private router: Router
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {
  }

  toggleSettings() {
    this._settingsService.toggleSettings();
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }

  logout() {
    this.authService.logout().then(() => this.router.navigate(['/login']));
  }
}
