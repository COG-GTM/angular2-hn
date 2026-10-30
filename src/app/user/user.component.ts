import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, EMPTY, switchMap } from 'rxjs';

import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { User } from '../shared/models/user';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoaderComponent, ErrorMessageComponent],
})
export class UserComponent {
  private readonly api = inject(HackerNewsAPIService);
  private readonly location = inject(Location);

  readonly user = signal<User | undefined>(undefined);
  readonly errorMessage = signal('');

  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(
        switchMap((params) => {
          const userId = params.get('id') ?? '';
          return this.api.fetchUser(userId).pipe(
            catchError(() => {
              this.errorMessage.set(`Could not load user ${userId}.`);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((user) => this.user.set(user));
  }

  goBack() {
    this.location.back();
  }
}
