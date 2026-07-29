export type SpendCategory = 'dining' | 'groceries' | 'travel' | 'fuel' | 'streaming' | 'shopping' | 'other';

export const SPEND_CATEGORY_LABELS: Record<SpendCategory, string> = {
    dining: 'Dining',
    groceries: 'Groceries',
    travel: 'Travel',
    fuel: 'Fuel',
    streaming: 'Streaming',
    shopping: 'Shopping',
    other: 'Everything else',
};

export interface Transaction {
    id: string;
    accountId: string;
    merchant: string;
    category: SpendCategory;
    /** ISO-8601 timestamp of when the transaction posted. */
    postedAt: string;
    /** Amount spent, in the account currency. */
    amount: number;
    /** Cashback rate applied to this transaction, expressed as a fraction (0.04 = 4%). */
    cashbackRate: number;
    /** Cashback credited for this transaction. */
    cashbackEarned: number;
    pending: boolean;
}
