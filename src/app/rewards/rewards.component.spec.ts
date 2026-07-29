import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RewardsComponent } from './rewards.component';

describe('RewardsComponent', () => {
    let fixture: ComponentFixture<RewardsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RewardsComponent],
            providers: [provideHttpClient(), provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(RewardsComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    it('breaks cashback down by spend category', () => {
        const rows: HTMLElement[] = Array.from(
            fixture.nativeElement.querySelectorAll('[data-testid="category-row"]')
        );

        expect(rows.length).toBeGreaterThan(1);
        expect(rows[0].textContent).toContain('4%');
    });

    it('shows the 4% rate and total cashback earned', () => {
        const rate = fixture.nativeElement.querySelector('[data-testid="cashback-rate"]');
        const total = fixture.nativeElement.querySelector('[data-testid="total-cashback"]');

        expect(rate.textContent.trim()).toBe('4%');
        expect(total.textContent.trim()).toMatch(/^\$\d/);
    });
});
