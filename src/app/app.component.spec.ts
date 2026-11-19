import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
    it('applies the theme from settings', async () => {
        localStorage.setItem('theme', 'night');
        window.matchMedia = ((query: string) => ({
            matches: false,
            media: query,
            addEventListener: () => {},
        })) as never;
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [provideRouter([])],
        }).compileComponents();
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        expect((fixture.nativeElement as HTMLElement).querySelector('.night')).toBeTruthy();
    });
});
