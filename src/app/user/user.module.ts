import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user.component';



const routes: Routes = [
  {
    path: ':id',
    component: UserComponent
  }
]


@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), UserComponent],
    exports: [UserComponent, RouterModule]
})
export class UserModule {}
