import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  standalone: false,
  name: 'comment',
  pure: true
})
export class CommentPipe implements PipeTransform {
  transform(comment: number): string {
   if (comment > 0) {
     let st = comment === 1 ? 'comment' : 'comments';
     return `${comment} ${st}`;
   }
   return 'discuss';
  }
}
