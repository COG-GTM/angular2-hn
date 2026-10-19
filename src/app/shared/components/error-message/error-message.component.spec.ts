import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let component: ErrorMessageComponent;
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [ErrorMessageComponent] }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should render the provided message and the offline hint', () => {
    component.message = 'Could not load news stories.';
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('p.strong').textContent).toBe('Could not load news stories.');
    expect(element.textContent).toContain('offline viewing');
  });
});
