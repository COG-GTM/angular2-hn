import { Pipe, PipeTransform } from '@angular/core';

/** Renders a rate fraction as a percentage, e.g. 0.04 -> "4%". */
@Pipe({ name: 'percentRate' })
export class PercentRatePipe implements PipeTransform {
    transform(rate: number | null | undefined, maximumFractionDigits = 2): string {
        if (rate === null || rate === undefined) {
            return '—';
        }
        return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits }).format(rate);
    }
}
