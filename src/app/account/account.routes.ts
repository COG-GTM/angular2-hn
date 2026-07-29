import { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
    {
        path: '',
        title: 'Card & settings · Vantage 4% Cash Card',
        loadComponent: () => import('./account.component').then((m) => m.AccountComponent),
    },
];
