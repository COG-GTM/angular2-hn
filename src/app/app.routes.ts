import { Routes } from '@angular/router';

import { FeedType } from './shared/models/feed-type.type';

const feedTypes: FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs'];

export const routes: Routes = [
    { path: '', redirectTo: 'news/1', pathMatch: 'full' },
    ...feedTypes.map((feedType) => ({
        path: `${feedType}/:page`,
        data: { feedType },
        loadComponent: () => import('./feeds/feed/feed.component').then((m) => m.FeedComponent),
    })),
    {
        path: 'item/:id',
        loadComponent: () => import('./item-details/item-details.component').then((m) => m.ItemDetailsComponent),
    },
    {
        path: 'user/:id',
        loadComponent: () => import('./user/user.component').then((m) => m.UserComponent),
    },
];
