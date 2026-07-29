import { SpendCategory } from './transaction';

export interface CashbackRate {
    /** Cashback rate as a fraction, e.g. 0.04 for the flat 4% program. */
    rate: number;
    headline: string;
    description: string;
    /** ISO-8601 date the rate became effective. */
    effectiveFrom: string;
    /** Annual cap on cashback earnings, or null when uncapped. */
    annualCap: number | null;
}

export interface CategoryReward {
    category: SpendCategory;
    label: string;
    spend: number;
    cashbackEarned: number;
    /** Share of total cashback earned, as a fraction between 0 and 1. */
    share: number;
}

export interface RewardsSummary {
    rate: number;
    periodLabel: string;
    totalSpend: number;
    totalCashbackEarned: number;
    cashbackRedeemed: number;
    cashbackAvailable: number;
    categories: CategoryReward[];
}
