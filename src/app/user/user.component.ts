import { Location } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { User } from '../shared/models/user';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  imports: [LoaderComponent, ErrorMessageComponent],
})
export class UserComponent implements OnInit {
  private readonly hackerNewsAPIService = inject(HackerNewsAPIService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  user: User;
  errorMessage = '';

  ngOnInit() {
    this.route.params
      .pipe(
        map(params => params['id'] as string),
        switchMap(userID =>
          this.hackerNewsAPIService.fetchUser(userID).pipe(
            catchError(() => {
              this.errorMessage = 'Could not load user ' + userID + '.';
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: user => (this.user = user),
      });
  }

  goBack() {
    this.location.back();
  }
}
