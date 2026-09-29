import { Routes } from '@angular/router';

const feedRoutes: Routes = [
  {
    path: ':page',
    loadComponent: () => import('./feeds/feed/feed.component').then(m => m.FeedComponent)
  }
];

export const routes: Routes = [
  {path: '', redirectTo: 'news/1', pathMatch: 'full'},
  {
    path: 'news',
    children: feedRoutes,
    data: {feedType: 'news'}
  },
  {
    path: 'newest',
    children: feedRoutes,
    data: {feedType: 'newest'}
  },
  {
    path: 'show',
    children: feedRoutes,
    data: {feedType: 'show'}
  },
  {
    path: 'ask',
    children: feedRoutes,
    data: {feedType: 'ask'}
  },
  {
    path: 'jobs',
    children: feedRoutes,
    data: {feedType: 'jobs'}
  },
  {path: 'item', loadChildren: () => import('./item-details/item-details.routes')},
  {path: 'user', loadChildren: () => import('./user/user.routes')}
];
