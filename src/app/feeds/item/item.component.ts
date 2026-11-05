import { Component, computed, inject, input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Story } from '../../shared/models/story';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-item',
  imports: [NgStyle, RouterLink, RouterLinkActive, CommentPipe],
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent {
  readonly item = input.required<Story>();
  readonly settings = inject(SettingsService).settings;
  readonly hasUrl = computed(() => this.item().url.startsWith('http'));
}
