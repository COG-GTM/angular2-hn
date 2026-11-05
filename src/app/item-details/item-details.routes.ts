import { Routes } from '@angular/router';

export default [
  { path: ':id', loadComponent: () => import('./item-details.component').then(m => m.ItemDetailsComponent) },
] satisfies Routes;
