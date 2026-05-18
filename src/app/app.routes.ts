import { Routes, RouterModule } from '@angular/router';

import { FeedComponent } from './feeds/feed/feed.component';
import { AuthGuard } from './shared/guards/auth.guard';

const feedRoutes = [{
  path: ':page',
  component: FeedComponent
}];

const routes: Routes = [
  {path: 'login', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
  {path: '', redirectTo: 'news/1', pathMatch: 'full'},
  {
    path: 'news',
    children: feedRoutes,
    data: {feedType: 'news'},
    canActivate: [AuthGuard]
  },
  {
    path: 'newest',
    children: feedRoutes,
    data: {feedType: 'newest'},
    canActivate: [AuthGuard]
  },
  {
    path: 'show',
    children: feedRoutes,
    data: {feedType: 'show'},
    canActivate: [AuthGuard]
  },
  {
    path: 'ask',
    children: feedRoutes,
    data: {feedType: 'ask'},
    canActivate: [AuthGuard]
  },
  {
    path: 'jobs',
    children: feedRoutes,
    data: {feedType: 'jobs'},
    canActivate: [AuthGuard]
  },
  {
    path: 'item',
    loadChildren: () => import('./item-details/item-details.module').then(m => m.ItemDetailsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    canActivate: [AuthGuard]
  }
];


// - Updated Export
export const routing = RouterModule.forRoot(routes);
