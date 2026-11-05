import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { LoadState, loading } from '../shared/models/load-state';
import { User } from '../shared/models/user';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';

@Component({
  selector: 'app-user',
  imports: [LoaderComponent, ErrorMessageComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  private readonly api = inject(HackerNewsAPIService);
  private readonly location = inject(Location);

  readonly state = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map(params => params.get('id') ?? ''),
      switchMap(userId =>
        this.api.fetchUser(userId).pipe(
          map((user): LoadState<User> => ({ data: user, error: '' })),
          catchError(() => of<LoadState<User>>({ data: null, error: `Could not load user ${userId}.` })),
          startWith(loading<User>())
        )
      )
    ),
    { initialValue: loading<User>() }
  );

  goBack() {
    this.location.back();
  }
}
