import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
    let fixture: ComponentFixture<DashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [provideHttpClient(), provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    function text(selector: string): string {
        return fixture.nativeElement.querySelector(selector)?.textContent?.trim() ?? '';
    }

    it('headlines the 4% cashback rate', () => {
        expect(text('[data-testid="cashback-rate"]')).toBe('4%');
    });

    it('shows total cashback earned and the current balance', () => {
        expect(text('[data-testid="total-cashback"]')).toMatch(/^\$\d/);
        expect(text('[data-testid="current-balance"]')).toMatch(/^\$\d/);
    });

    it('lists recent transactions with the cashback they earned', () => {
        const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.list-row'));

        expect(rows.length).toBe(5);
        expect(rows[0].textContent).toContain('back');
    });
});
