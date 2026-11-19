import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Story } from '../../shared/models/story';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
    selector: 'item',
    imports: [RouterLink, RouterLinkActive, CommentPipe],
    templateUrl: './item.component.html',
    styleUrl: './item.component.scss',
})
export class ItemComponent {
    readonly item = input.required<Story>();
    readonly settings = inject(SettingsService).settings;
    readonly hasUrl = computed(() => this.item().url.indexOf('http') === 0);
}
