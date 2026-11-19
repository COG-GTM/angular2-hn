import { Location } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';

@Component({
    selector: 'app-user',
    imports: [LoaderComponent, ErrorMessageComponent],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss',
})
export class UserComponent {
    private readonly hackerNewsAPIService = inject(HackerNewsAPIService);
    private readonly location = inject(Location);

    readonly id = input.required<string>();

    private readonly userResource = rxResource({
        params: () => this.id(),
        stream: ({ params: id }) =>
            this.hackerNewsAPIService.fetchUser(id).pipe(
                map((user) => {
                    if (!user) {
                        throw new Error(`User ${id} not found`);
                    }
                    return user;
                })
            ),
    });

    readonly user = computed(() => (this.userResource.hasValue() ? this.userResource.value() : undefined));
    readonly errorMessage = computed(() => (this.userResource.error() ? `Could not load user ${this.id()}.` : ''));

    goBack() {
        this.location.back();
    }
}
