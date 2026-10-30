import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Story } from '../../shared/models/story';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgStyle, RouterLinkActive, RouterLink, CommentPipe],
})
export class ItemComponent {
  readonly item = input.required<Story>();
  readonly settings = inject(SettingsService).settings;
  readonly hasUrl = computed(() => this.item().url?.indexOf('http') === 0);
}
