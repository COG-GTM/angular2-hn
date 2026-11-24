import { Routes } from '@angular/router';

import { ItemDetailsComponent } from './item-details.component';

export const ITEM_DETAILS_ROUTES: Routes = [
  {
    path: ':id',
    component: ItemDetailsComponent
  }
];
