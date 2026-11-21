import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

@Component({ template: '' })
class BlankComponent {}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  const navLinks = (): HTMLAnchorElement[] => Array.from(fixture.nativeElement.querySelectorAll('.header-nav a'));
  const savedLink = () => navLinks().find(a => a.textContent.trim() === 'saved');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'saved', component: BlankComponent },
          { path: ':feed/:page', component: BlankComponent },
        ]),
      ],
      declarations: [HeaderComponent, BlankComponent],
      providers: [{ provide: SettingsService, useValue: { settings: { showSettings: false }, toggleSettings: () => {} } }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('shows the saved tab last in the nav, after jobs', () => {
    expect(navLinks().map(a => a.textContent.trim())).toEqual(['new', 'show', 'ask', 'jobs', 'saved']);
    expect(savedLink().getAttribute('href')).toBe('/saved');
  });

  it('marks the saved tab active only on /saved', async () => {
    const router = TestBed.inject(Router);
    await fixture.ngZone.run(() => router.navigateByUrl('/saved'));
    fixture.detectChanges();
    expect(savedLink().classList).toContain('active');

    await fixture.ngZone.run(() => router.navigateByUrl('/jobs/1'));
    fixture.detectChanges();
    expect(savedLink().classList).not.toContain('active');
  });

  it('scrolls to the top when the saved tab is clicked', () => {
    spyOn(window, 'scrollTo');
    savedLink().click();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
