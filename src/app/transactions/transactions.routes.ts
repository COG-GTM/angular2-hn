import { Routes } from '@angular/router';

export const TRANSACTIONS_ROUTES: Routes = [
    {
        path: '',
        title: 'Transactions · Vantage 4% Cash Card',
        loadComponent: () => import('./transactions.component').then((m) => m.TransactionsComponent),
    },
    {
        path: ':id',
        title: 'Transaction · Vantage 4% Cash Card',
        loadComponent: () =>
            import('./transaction-details/transaction-details.component').then((m) => m.TransactionDetailsComponent),
    },
];
