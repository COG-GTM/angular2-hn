import { Routes } from '@angular/router';

import { UserComponent } from './user.component';

const routes: Routes = [
  {
    path: ':id',
    component: UserComponent
  }
];

export default routes;
