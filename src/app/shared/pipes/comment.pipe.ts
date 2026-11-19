import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'comment' })
export class CommentPipe implements PipeTransform {
    transform(count: number): string {
        if (count > 0) {
            return `${count} ${count === 1 ? 'comment' : 'comments'}`;
        }
        return 'discuss';
    }
}
