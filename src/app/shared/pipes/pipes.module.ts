import { NgModule } from '@angular/core';
import { CommentPipe } from './comment.pipe';

@NgModule({
    imports: [CommentPipe],
    exports: [CommentPipe]
})
export class PipesModule {}
