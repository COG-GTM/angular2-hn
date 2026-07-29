import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { CASHBACK_RATE, calculateCashback } from '../data/mock-cashback-data';
import { CashbackApiService, summarizeRewards } from './cashback-api.service';

describe('CashbackApiService', () => {
    let service: CashbackApiService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient()] });
        service = TestBed.inject(CashbackApiService);
    });

    it('publishes the flat 4% cashback rate', async () => {
        const rate = await firstValueFrom(service.fetchCashbackRate());

        expect(rate.rate).toBe(0.04);
        expect(rate.headline).toContain('4%');
    });

    it('applies 4% cashback to every transaction', async () => {
        const transactions = await firstValueFrom(service.fetchTransactions());

        expect(transactions.length).toBeGreaterThan(0);
        for (const transaction of transactions) {
            expect(transaction.cashbackRate).toBe(CASHBACK_RATE);
            expect(transaction.cashbackEarned).toBe(calculateCashback(transaction.amount));
        }
    });

    it('looks up a single transaction by id', async () => {
        const transactions = await firstValueFrom(service.fetchTransactions());
        const expected = transactions[0];

        const transaction = await firstValueFrom(service.fetchTransaction(expected.id));

        expect(transaction).toEqual(expected);
    });

    it('returns card accounts with balances that fit their credit limit', async () => {
        const accounts = await firstValueFrom(service.fetchCardAccounts());

        expect(accounts.length).toBeGreaterThan(0);
        for (const account of accounts) {
            expect(account.currentBalance + account.availableCredit).toBeCloseTo(account.creditLimit, 2);
        }
    });

    it('summarizes rewards from the transaction ledger', async () => {
        const [transactions, summary] = await Promise.all([
            firstValueFrom(service.fetchTransactions()),
            firstValueFrom(service.fetchRewardsSummary()),
        ]);

        const expectedSpend = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

        expect(summary.rate).toBe(0.04);
        expect(summary.totalSpend).toBeCloseTo(expectedSpend, 2);
        expect(summary.totalCashbackEarned).toBeCloseTo(expectedSpend * 0.04, 1);
        expect(summary.cashbackAvailable).toBeCloseTo(summary.totalCashbackEarned - summary.cashbackRedeemed, 2);
    });
});

describe('summarizeRewards', () => {
    it('groups cashback by category and computes each share', () => {
        const summary = summarizeRewards(
            [
                {
                    id: 'a',
                    accountId: 'acct',
                    merchant: 'Cafe',
                    category: 'dining',
                    postedAt: '2026-07-01T00:00:00Z',
                    amount: 100,
                    cashbackRate: 0.04,
                    cashbackEarned: 4,
                    pending: false,
                },
                {
                    id: 'b',
                    accountId: 'acct',
                    merchant: 'Grocer',
                    category: 'groceries',
                    postedAt: '2026-07-02T00:00:00Z',
                    amount: 300,
                    cashbackRate: 0.04,
                    cashbackEarned: 12,
                    pending: false,
                },
            ],
            0
        );

        expect(summary.totalSpend).toBe(400);
        expect(summary.totalCashbackEarned).toBe(16);
        expect(summary.cashbackAvailable).toBe(16);
        expect(summary.categories.map((category) => category.category)).toEqual(['groceries', 'dining']);
        expect(summary.categories[0].share).toBeCloseTo(0.75, 5);
    });
});
