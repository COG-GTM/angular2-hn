import { NgModule } from '@angular/core';
import { CommentPipe } from './comment.pipe';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';

@NgModule({
  declarations: [CommentPipe, SanitizeHtmlPipe],
  exports: [CommentPipe, SanitizeHtmlPipe]
})
export class PipesModule {}
