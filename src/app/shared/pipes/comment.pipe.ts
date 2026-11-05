import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'comment' })
export class CommentPipe implements PipeTransform {
  transform(count: number | null | undefined): string {
    if (count && count > 0) {
      return `${count} ${count === 1 ? 'comment' : 'comments'}`;
    }
    return 'discuss';
  }
}
