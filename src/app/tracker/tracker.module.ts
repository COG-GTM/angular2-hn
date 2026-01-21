import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TrackerComponent } from './tracker.component';

const routes: Routes = [
  { path: '', component: TrackerComponent }
];

@NgModule({
  declarations: [TrackerComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class TrackerModule { }
