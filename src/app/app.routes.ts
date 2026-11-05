import { Routes } from '@angular/router';

import { FeedComponent } from './feeds/feed/feed.component';

const feedRoutes: Routes = [{ path: ':page', component: FeedComponent }];

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

export const routes: Routes = [
  { path: '', redirectTo: 'news/1', pathMatch: 'full' },
  ...feedTypes.map(feedType => ({ path: feedType, children: feedRoutes, data: { feedType } })),
  { path: 'item', loadChildren: () => import('./item-details/item-details.routes') },
  { path: 'user', loadChildren: () => import('./user/user.routes') },
];
