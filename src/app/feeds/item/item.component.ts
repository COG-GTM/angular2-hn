import { Component, Input } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NgStyle, NgIf } from '@angular/common';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    standalone: true,
    imports: [NgStyle, NgIf, RouterLinkActive, RouterLink, CommentPipe]
})
export class ItemComponent {
  @Input() item: Story;
  settings: Settings;

  constructor(private _settingsService: SettingsService) {
    this.settings = this._settingsService.settings;
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

}
