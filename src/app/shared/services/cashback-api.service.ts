import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
    CASHBACK_RATE,
    MOCK_CARD_ACCOUNTS,
    MOCK_CASHBACK_RATE,
    MOCK_CASHBACK_REDEEMED,
    MOCK_TRANSACTIONS,
} from '../data/mock-cashback-data';
import { CardAccount } from '../models/card-account';
import { CashbackRate, CategoryReward, RewardsSummary } from '../models/reward';
import { SPEND_CATEGORY_LABELS, SpendCategory, Transaction } from '../models/transaction';

/**
 * Single entry point for cashback data.
 *
 * There is no cashback backend yet, so every endpoint falls back to in-memory fixtures.
 * Point `environment.apiBaseUrl` at a real service and the same methods issue HttpClient
 * requests instead — no caller changes required.
 */
@Injectable({ providedIn: 'root' })
export class CashbackApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;
    /** Latency applied to mocked responses so loading states stay exercised. */
    private readonly mockLatencyMs = 150;

    fetchCashbackRate(): Observable<CashbackRate> {
        return this.request('/cashback-rate', MOCK_CASHBACK_RATE);
    }

    fetchCardAccounts(): Observable<CardAccount[]> {
        return this.request('/card-accounts', MOCK_CARD_ACCOUNTS);
    }

    fetchCardAccount(accountId: string): Observable<CardAccount | undefined> {
        return this.fetchCardAccounts().pipe(map((accounts) => accounts.find((account) => account.id === accountId)));
    }

    fetchTransactions(): Observable<Transaction[]> {
        return this.request('/transactions', MOCK_TRANSACTIONS);
    }

    fetchTransaction(transactionId: string): Observable<Transaction | undefined> {
        return this.fetchTransactions().pipe(
            map((transactions) => transactions.find((transaction) => transaction.id === transactionId))
        );
    }

    fetchRewardsSummary(): Observable<RewardsSummary> {
        if (this.baseUrl) {
            return this.http.get<RewardsSummary>(`${this.baseUrl}/rewards-summary`);
        }
        return this.fetchTransactions().pipe(map((transactions) => summarizeRewards(transactions)));
    }

    private request<T>(path: string, mock: T): Observable<T> {
        if (this.baseUrl) {
            return this.http.get<T>(`${this.baseUrl}${path}`);
        }
        return of(mock).pipe(delay(this.mockLatencyMs));
    }
}

/** Derives the rewards breakdown from transactions so the mock stays consistent with the ledger. */
export function summarizeRewards(
    transactions: Transaction[],
    redeemed: number = MOCK_CASHBACK_REDEEMED
): RewardsSummary {
    const totalSpend = round(transactions.reduce((sum, transaction) => sum + transaction.amount, 0));
    const totalCashbackEarned = round(
        transactions.reduce((sum, transaction) => sum + transaction.cashbackEarned, 0)
    );

    const byCategory = new Map<SpendCategory, CategoryReward>();
    for (const transaction of transactions) {
        const entry = byCategory.get(transaction.category) ?? {
            category: transaction.category,
            label: SPEND_CATEGORY_LABELS[transaction.category],
            spend: 0,
            cashbackEarned: 0,
            share: 0,
        };
        entry.spend = round(entry.spend + transaction.amount);
        entry.cashbackEarned = round(entry.cashbackEarned + transaction.cashbackEarned);
        byCategory.set(transaction.category, entry);
    }

    const categories = [...byCategory.values()]
        .map((entry) => ({
            ...entry,
            share: totalCashbackEarned ? entry.cashbackEarned / totalCashbackEarned : 0,
        }))
        .sort((a, b) => b.cashbackEarned - a.cashbackEarned);

    return {
        rate: CASHBACK_RATE,
        periodLabel: 'Year to date',
        totalSpend,
        totalCashbackEarned,
        cashbackRedeemed: redeemed,
        cashbackAvailable: round(totalCashbackEarned - redeemed),
        categories,
    };
}

function round(value: number): number {
    return Math.round(value * 100) / 100;
}
