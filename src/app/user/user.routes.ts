import { Routes } from '@angular/router';

export default [
  { path: ':id', loadComponent: () => import('./user.component').then(m => m.UserComponent) },
] satisfies Routes;
