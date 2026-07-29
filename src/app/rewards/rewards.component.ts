import { PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { AmountPipe } from '../shared/pipes/amount.pipe';
import { PercentRatePipe } from '../shared/pipes/percent-rate.pipe';
import { CashbackApiService } from '../shared/services/cashback-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { hasError, isLoading, loadedValue, toLoadState } from '../shared/util/load-state';

@Component({
    selector: 'app-rewards',
    imports: [RouterLink, PercentPipe, AmountPipe, PercentRatePipe, LoaderComponent, ErrorMessageComponent],
    templateUrl: './rewards.component.html',
    styleUrl: './rewards.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardsComponent {
    private readonly api = inject(CashbackApiService);
    private readonly settingsService = inject(SettingsService);

    readonly maskAmounts = this.settingsService.maskAmounts;

    private readonly summaryState = toLoadState(this.api.fetchRewardsSummary());
    private readonly rateState = toLoadState(this.api.fetchCashbackRate());

    readonly loading = computed(() => isLoading(this.summaryState(), this.rateState()));
    readonly errored = computed(() => hasError(this.summaryState(), this.rateState()));
    readonly summary = computed(() => loadedValue(this.summaryState()));
    readonly rate = computed(() => loadedValue(this.rateState()));

    /** Widest category bar fills the track so smaller categories stay readable. */
    readonly maxCategoryCashback = computed(() =>
        Math.max(...(this.summary()?.categories.map((category) => category.cashbackEarned) ?? [0]), 0)
    );

    barWidth(cashbackEarned: number): string {
        const max = this.maxCategoryCashback();
        return max ? `${(cashbackEarned / max) * 100}%` : '0%';
    }
}
