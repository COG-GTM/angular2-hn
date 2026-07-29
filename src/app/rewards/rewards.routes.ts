import { Routes } from '@angular/router';

export const REWARDS_ROUTES: Routes = [
    {
        path: '',
        title: 'Rewards · Vantage 4% Cash Card',
        loadComponent: () => import('./rewards.component').then((m) => m.RewardsComponent),
    },
];
