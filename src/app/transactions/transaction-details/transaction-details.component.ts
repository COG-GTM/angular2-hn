import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { SPEND_CATEGORY_LABELS, SpendCategory } from '../../shared/models/transaction';
import { AmountPipe } from '../../shared/pipes/amount.pipe';
import { PercentRatePipe } from '../../shared/pipes/percent-rate.pipe';
import { CashbackApiService } from '../../shared/services/cashback-api.service';
import { SettingsService } from '../../shared/services/settings.service';
import { hasError, isLoading, loadedValue, toLoadState } from '../../shared/util/load-state';

@Component({
    selector: 'app-transaction-details',
    imports: [RouterLink, DatePipe, AmountPipe, PercentRatePipe, LoaderComponent, ErrorMessageComponent],
    templateUrl: './transaction-details.component.html',
    styleUrl: './transaction-details.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionDetailsComponent {
    private readonly api = inject(CashbackApiService);
    private readonly settingsService = inject(SettingsService);

    /** Bound from the `:id` route parameter via `withComponentInputBinding()`. */
    readonly id = input.required<string>();

    readonly maskAmounts = this.settingsService.maskAmounts;

    private readonly transactionState = toLoadState(
        toObservable(this.id).pipe(switchMap((id) => this.api.fetchTransaction(id)))
    );

    readonly loading = computed(() => isLoading(this.transactionState()));
    readonly errored = computed(() => hasError(this.transactionState()));
    readonly transaction = computed(() => loadedValue(this.transactionState()) ?? null);
    readonly notFound = computed(() => this.transactionState().status === 'loaded' && !this.transaction());

    categoryLabel(category: SpendCategory): string {
        return SPEND_CATEGORY_LABELS[category];
    }
}
