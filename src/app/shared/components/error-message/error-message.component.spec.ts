import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [ErrorMessageComponent] });
    fixture = TestBed.createComponent(ErrorMessageComponent);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('displays the message input', () => {
    fixture.componentInstance.message = 'Could not load news stories.';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p.strong').textContent).toBe('Could not load news stories.');
  });

  it('always shows the offline hint', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('visit this page with a network connection first');
    expect(fixture.nativeElement.querySelector('.skull')).toBeTruthy();
  });
});
