import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';




const routes: Routes = [
  {
    path: ':id',
    component: ItemDetailsComponent
  }
]

@NgModule({
    imports: [CommonModule, RouterModule, RouterModule.forChild(routes), ItemDetailsComponent, CommentComponent],
    exports: [ItemDetailsComponent, RouterModule]
})
export class ItemDetailsModule {}
