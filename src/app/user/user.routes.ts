import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: ':id',
    loadComponent: () => import('./user.component').then(m => m.UserComponent)
  }
];
