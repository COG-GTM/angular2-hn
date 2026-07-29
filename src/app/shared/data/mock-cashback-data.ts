import { CardAccount } from '../models/card-account';
import { CashbackRate } from '../models/reward';
import { SpendCategory, Transaction } from '../models/transaction';

/** Flat cashback rate of the Vantage program: 4% on every purchase. */
export const CASHBACK_RATE = 0.04;

export const MOCK_CASHBACK_RATE: CashbackRate = {
    rate: CASHBACK_RATE,
    headline: '4% cash back on every purchase',
    description:
        'Every eligible purchase earns a flat 4% back — no categories to activate, no rotating bonuses, no minimum spend.',
    effectiveFrom: '2026-01-01',
    annualCap: null,
};

export const MOCK_CARD_ACCOUNTS: CardAccount[] = [
    {
        id: 'acct-4021',
        productName: 'Vantage 4% Cash Card',
        cardholderName: 'Alex Morgan',
        last4: '4021',
        network: 'visa',
        currency: 'USD',
        currentBalance: 1284.55,
        statementBalance: 962.18,
        creditLimit: 12000,
        availableCredit: 10715.45,
        paymentDueDate: '2026-08-14',
        status: 'active',
    },
    {
        id: 'acct-8890',
        productName: 'Vantage 4% Cash Card — Household',
        cardholderName: 'Jordan Morgan',
        last4: '8890',
        network: 'visa',
        currency: 'USD',
        currentBalance: 318.4,
        statementBalance: 210.0,
        creditLimit: 4000,
        availableCredit: 3681.6,
        paymentDueDate: '2026-08-14',
        status: 'active',
    },
];

interface MockSpend {
    id: string;
    accountId: string;
    merchant: string;
    category: SpendCategory;
    postedAt: string;
    amount: number;
    pending?: boolean;
}

/** Raw spend rows; cashback is derived so the 4% rate is applied in exactly one place. */
const MOCK_SPEND: MockSpend[] = [
    { id: 'txn-1042', accountId: 'acct-4021', merchant: 'Blue Bottle Coffee', category: 'dining', postedAt: '2026-07-28T14:12:00Z', amount: 18.75, pending: true },
    { id: 'txn-1041', accountId: 'acct-4021', merchant: 'Whole Foods Market', category: 'groceries', postedAt: '2026-07-27T18:04:00Z', amount: 143.28 },
    { id: 'txn-1040', accountId: 'acct-8890', merchant: 'Shell', category: 'fuel', postedAt: '2026-07-27T08:47:00Z', amount: 62.1 },
    { id: 'txn-1039', accountId: 'acct-4021', merchant: 'Delta Air Lines', category: 'travel', postedAt: '2026-07-25T21:30:00Z', amount: 486.4 },
    { id: 'txn-1038', accountId: 'acct-4021', merchant: 'Netflix', category: 'streaming', postedAt: '2026-07-24T06:00:00Z', amount: 22.99 },
    { id: 'txn-1037', accountId: 'acct-8890', merchant: 'Target', category: 'shopping', postedAt: '2026-07-23T16:22:00Z', amount: 208.63 },
    { id: 'txn-1036', accountId: 'acct-4021', merchant: 'Sweetgreen', category: 'dining', postedAt: '2026-07-22T12:41:00Z', amount: 16.4 },
    { id: 'txn-1035', accountId: 'acct-4021', merchant: 'Trader Joe’s', category: 'groceries', postedAt: '2026-07-21T19:05:00Z', amount: 87.92 },
    { id: 'txn-1034', accountId: 'acct-4021', merchant: 'Marriott Bonvoy', category: 'travel', postedAt: '2026-07-19T23:11:00Z', amount: 312.0 },
    { id: 'txn-1033', accountId: 'acct-8890', merchant: 'Spotify', category: 'streaming', postedAt: '2026-07-18T06:00:00Z', amount: 11.99 },
    { id: 'txn-1032', accountId: 'acct-4021', merchant: 'Costco Gas', category: 'fuel', postedAt: '2026-07-17T09:38:00Z', amount: 54.72 },
    { id: 'txn-1031', accountId: 'acct-4021', merchant: 'Apple Store', category: 'shopping', postedAt: '2026-07-15T15:00:00Z', amount: 399.0 },
    { id: 'txn-1030', accountId: 'acct-4021', merchant: 'City Parking Authority', category: 'other', postedAt: '2026-07-14T17:26:00Z', amount: 24.0 },
    { id: 'txn-1029', accountId: 'acct-8890', merchant: 'Chipotle', category: 'dining', postedAt: '2026-07-12T13:09:00Z', amount: 31.18 },
];

/** Rounds to whole cents so displayed cashback always adds up. */
export function calculateCashback(amount: number, rate: number = CASHBACK_RATE): number {
    return Math.round(amount * rate * 100) / 100;
}

export const MOCK_TRANSACTIONS: Transaction[] = MOCK_SPEND.map((spend) => ({
    ...spend,
    pending: spend.pending ?? false,
    cashbackRate: CASHBACK_RATE,
    cashbackEarned: calculateCashback(spend.amount),
}));

/** Cashback already redeemed as a statement credit this year. */
export const MOCK_CASHBACK_REDEEMED = 45.0;
