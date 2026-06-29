import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SavedComponent } from './saved.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';

const routes: Routes = [
  {
    path: '',
    component: SavedComponent
  }
];

@NgModule({
  imports: [CommonModule, SharedComponentsModule, RouterModule.forChild(routes)],
  declarations: [SavedComponent]
})
export class SavedModule {}
