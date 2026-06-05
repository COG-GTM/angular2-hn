import { Routes } from '@angular/router';

import { ItemDetailsComponent } from './item-details.component';

export const routes: Routes = [{ path: ':id', component: ItemDetailsComponent }];
