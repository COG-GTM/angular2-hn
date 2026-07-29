import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { AmountPipe } from '../shared/pipes/amount.pipe';
import { PercentRatePipe } from '../shared/pipes/percent-rate.pipe';
import { CashbackApiService } from '../shared/services/cashback-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { hasError, isLoading, loadedValue, toLoadState } from '../shared/util/load-state';

const RECENT_TRANSACTION_COUNT = 5;

@Component({
    selector: 'app-dashboard',
    imports: [
        RouterLink,
        DatePipe,
        TitleCasePipe,
        AmountPipe,
        PercentRatePipe,
        LoaderComponent,
        ErrorMessageComponent,
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
    private readonly api = inject(CashbackApiService);
    private readonly settingsService = inject(SettingsService);

    readonly maskAmounts = this.settingsService.maskAmounts;

    private readonly rateState = toLoadState(this.api.fetchCashbackRate());
    private readonly accountsState = toLoadState(this.api.fetchCardAccounts());
    private readonly rewardsState = toLoadState(this.api.fetchRewardsSummary());
    private readonly transactionsState = toLoadState(this.api.fetchTransactions());

    readonly loading = computed(() =>
        isLoading(this.rateState(), this.accountsState(), this.rewardsState(), this.transactionsState())
    );
    readonly errored = computed(() =>
        hasError(this.rateState(), this.accountsState(), this.rewardsState(), this.transactionsState())
    );

    readonly cashbackRate = computed(() => loadedValue(this.rateState()));
    readonly rewards = computed(() => loadedValue(this.rewardsState()));
    private readonly accounts = computed(() => loadedValue(this.accountsState()) ?? []);

    readonly primaryAccount = computed(() => this.accounts()[0] ?? null);
    readonly totalBalance = computed(() => this.accounts().reduce((sum, account) => sum + account.currentBalance, 0));
    readonly availableCredit = computed(() =>
        this.accounts().reduce((sum, account) => sum + account.availableCredit, 0)
    );
    readonly recentTransactions = computed(() =>
        [...(loadedValue(this.transactionsState()) ?? [])]
            .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
            .slice(0, RECENT_TRANSACTION_COUNT)
    );
}
