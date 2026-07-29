import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { SettingsControlsComponent } from '../core/settings/settings-controls.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { AmountPipe } from '../shared/pipes/amount.pipe';
import { PercentRatePipe } from '../shared/pipes/percent-rate.pipe';
import { CashbackApiService } from '../shared/services/cashback-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { hasError, isLoading, loadedValue, toLoadState } from '../shared/util/load-state';

@Component({
    selector: 'app-account',
    imports: [
        DatePipe,
        TitleCasePipe,
        AmountPipe,
        PercentRatePipe,
        LoaderComponent,
        ErrorMessageComponent,
        SettingsControlsComponent,
    ],
    templateUrl: './account.component.html',
    styleUrl: './account.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
    private readonly api = inject(CashbackApiService);
    private readonly settingsService = inject(SettingsService);

    readonly maskAmounts = this.settingsService.maskAmounts;

    private readonly accountsState = toLoadState(this.api.fetchCardAccounts());
    private readonly rateState = toLoadState(this.api.fetchCashbackRate());

    readonly loading = computed(() => isLoading(this.accountsState(), this.rateState()));
    readonly errored = computed(() => hasError(this.accountsState(), this.rateState()));
    readonly accounts = computed(() => loadedValue(this.accountsState()) ?? []);
    readonly rate = computed(() => loadedValue(this.rateState()));

    utilization(currentBalance: number, creditLimit: number): string {
        return creditLimit ? `${Math.round((currentBalance / creditLimit) * 100)}%` : '—';
    }
}
