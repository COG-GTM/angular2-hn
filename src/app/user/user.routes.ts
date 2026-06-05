import { Routes } from '@angular/router';

import { UserComponent } from './user.component';

export const routes: Routes = [{ path: ':id', component: UserComponent }];
