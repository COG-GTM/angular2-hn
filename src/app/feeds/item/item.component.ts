import { NgStyle } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  imports: [NgStyle, RouterLinkActive, RouterLink, CommentPipe],
})
export class ItemComponent {
  @Input() item: Story;

  settings: Settings = inject(SettingsService).settings;

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }
}
