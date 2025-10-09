import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let component: ErrorMessageComponent;
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorMessageComponent]
    });

    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept message as input', () => {
    component.message = 'Test error message';
    expect(component.message).toBe('Test error message');
  });

  it('should handle empty message', () => {
    component.message = '';
    expect(component.message).toBe('');
  });

  it('should initialize on ngOnInit', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });
});
