import { Routes } from '@angular/router';

export const ITEM_DETAILS_ROUTES: Routes = [
  {
    path: ':id',
    loadComponent: () => import('./item-details.component').then(m => m.ItemDetailsComponent)
  }
];
