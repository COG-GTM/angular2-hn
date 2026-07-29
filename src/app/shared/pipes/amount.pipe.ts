import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a monetary amount, replacing it with dots when the user has masked amounts.
 * `masked` is passed in explicitly so the pipe stays pure.
 */
@Pipe({ name: 'amount' })
export class AmountPipe implements PipeTransform {
    transform(value: number | null | undefined, masked = false, currency = 'USD'): string {
        if (value === null || value === undefined) {
            return '—';
        }
        if (masked) {
            return '••••';
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
    }
}
