import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoaderComponent } from './loader/loader.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { BookmarkButtonComponent } from './bookmark-button/bookmark-button.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ LoaderComponent, ErrorMessageComponent, BookmarkButtonComponent ],
  exports: [ LoaderComponent, ErrorMessageComponent, BookmarkButtonComponent ]
})
export class SharedComponentsModule {}
