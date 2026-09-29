import { Routes } from '@angular/router';

import { ItemDetailsComponent } from './item-details.component';

const routes: Routes = [
  {
    path: ':id',
    component: ItemDetailsComponent
  }
];

export default routes;
