import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { SPEND_CATEGORY_LABELS, SpendCategory } from '../shared/models/transaction';
import { AmountPipe } from '../shared/pipes/amount.pipe';
import { PercentRatePipe } from '../shared/pipes/percent-rate.pipe';
import { CashbackApiService } from '../shared/services/cashback-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { hasError, isLoading, loadedValue, toLoadState } from '../shared/util/load-state';

type CategoryFilter = SpendCategory | 'all';

@Component({
    selector: 'app-transactions',
    imports: [RouterLink, DatePipe, AmountPipe, PercentRatePipe, LoaderComponent, ErrorMessageComponent],
    templateUrl: './transactions.component.html',
    styleUrl: './transactions.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent {
    private readonly api = inject(CashbackApiService);
    private readonly settingsService = inject(SettingsService);

    readonly maskAmounts = this.settingsService.maskAmounts;
    readonly rowPadding = this.settingsService.rowPadding;
    readonly titleFontSize = this.settingsService.titleFontSize;

    private readonly transactionsState = toLoadState(this.api.fetchTransactions());
    private readonly rateState = toLoadState(this.api.fetchCashbackRate());

    readonly loading = computed(() => isLoading(this.transactionsState(), this.rateState()));
    readonly errored = computed(() => hasError(this.transactionsState(), this.rateState()));
    readonly cashbackRate = computed(() => loadedValue(this.rateState())?.rate ?? null);

    readonly selectedCategory = signal<CategoryFilter>('all');

    private readonly transactions = computed(() =>
        [...(loadedValue(this.transactionsState()) ?? [])].sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    );

    readonly filters = computed<{ value: CategoryFilter; label: string }[]>(() => {
        const categories = [...new Set(this.transactions().map((transaction) => transaction.category))];
        return [
            { value: 'all' as const, label: 'All' },
            ...categories.map((category) => ({ value: category, label: SPEND_CATEGORY_LABELS[category] })),
        ];
    });

    readonly visibleTransactions = computed(() => {
        const category = this.selectedCategory();
        return category === 'all'
            ? this.transactions()
            : this.transactions().filter((transaction) => transaction.category === category);
    });

    readonly totalSpend = computed(() =>
        this.visibleTransactions().reduce((sum, transaction) => sum + transaction.amount, 0)
    );
    readonly totalCashback = computed(() =>
        this.visibleTransactions().reduce((sum, transaction) => sum + transaction.cashbackEarned, 0)
    );

    selectCategory(category: CategoryFilter): void {
        this.selectedCategory.set(category);
    }

    categoryLabel(category: SpendCategory): string {
        return SPEND_CATEGORY_LABELS[category];
    }
}
