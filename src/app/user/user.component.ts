import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    imports: [LoaderComponent, ErrorMessageComponent]
})
export class UserComponent implements OnInit {
  private _hackerNewsAPIService = inject(HackerNewsAPIService);
  private route = inject(ActivatedRoute);
  private _location = inject(Location);
  private destroyRef = inject(DestroyRef);

  readonly user = signal<User | undefined>(undefined);
  readonly errorMessage = signal('');

  ngOnInit() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const userID = params['id'];
        this._hackerNewsAPIService.fetchUser(userID)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: data => this.user.set(data),
            error: () => this.errorMessage.set('Could not load user ' + userID + '.')
          });
      });
  }

  goBack() {
    this._location.back();
  }
}
