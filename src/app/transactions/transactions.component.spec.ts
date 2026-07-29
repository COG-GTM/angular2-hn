import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TransactionsComponent } from './transactions.component';

describe('TransactionsComponent', () => {
    let fixture: ComponentFixture<TransactionsComponent>;
    let component: TransactionsComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TransactionsComponent],
            providers: [provideHttpClient(), provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(TransactionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    it('shows every transaction with its 4% cashback', () => {
        const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.list-row'));

        expect(rows.length).toBe(component.visibleTransactions().length);
        expect(rows[0].textContent).toContain('4%');
        expect(component.totalCashback()).toBeCloseTo(component.totalSpend() * 0.04, 1);
    });

    it('filters the list and its totals by category', () => {
        component.selectCategory('dining');
        fixture.detectChanges();

        const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.list-row'));

        expect(rows.length).toBe(component.visibleTransactions().length);
        expect(component.visibleTransactions().every((transaction) => transaction.category === 'dining')).toBeTrue();
        expect(component.totalCashback()).toBeCloseTo(component.totalSpend() * 0.04, 1);
    });
});
