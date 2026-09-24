import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [ErrorMessageComponent] }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorMessageComponent);
  });

  it('renders the provided message', () => {
    fixture.componentInstance.message = 'Something broke';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.strong').textContent).toContain('Something broke');
  });
});
