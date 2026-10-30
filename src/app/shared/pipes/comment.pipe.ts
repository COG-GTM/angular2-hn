import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'comment' })
export class CommentPipe implements PipeTransform {
  transform(comment: number): string {
    if (comment > 0) {
      return `${comment} ${comment === 1 ? 'comment' : 'comments'}`;
    }
    return 'discuss';
  }
}
