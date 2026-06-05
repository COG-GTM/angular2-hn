import { Component, Input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Story } from '../../shared/models/story';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [NgStyle, RouterLink, RouterLinkActive, CommentPipe],
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent {
  @Input() item!: Story;
  settings: Settings;

  constructor(private _settingsService: SettingsService) {
    this.settings = this._settingsService.settings;
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }
}
