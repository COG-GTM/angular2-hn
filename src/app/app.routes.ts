import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    {
        path: 'dashboard',
        title: 'Dashboard · Vantage 4% Cash Card',
        loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    },
    {
        path: 'transactions',
        loadChildren: () => import('./transactions/transactions.routes').then((m) => m.TRANSACTIONS_ROUTES),
    },
    {
        path: 'rewards',
        loadChildren: () => import('./rewards/rewards.routes').then((m) => m.REWARDS_ROUTES),
    },
    {
        path: 'account',
        loadChildren: () => import('./account/account.routes').then((m) => m.ACCOUNT_ROUTES),
    },
    { path: '**', redirectTo: 'dashboard' },
];
