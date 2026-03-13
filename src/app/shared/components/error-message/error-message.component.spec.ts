import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
    let component: ErrorMessageComponent;
    let fixture: ComponentFixture<ErrorMessageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ErrorMessageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorMessageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render error section', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const errorSection = compiled.querySelector('.error-section');
        expect(errorSection).toBeTruthy();
    });

    it('should display the error message', () => {
        component.message = 'Something went wrong';
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const messageElement = compiled.querySelector('.strong');
        expect(messageElement.textContent).toContain('Something went wrong');
    });

    it('should display offline message', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.textContent).toContain('offline');
    });

    it('should render skull element', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const skull = compiled.querySelector('.skull');
        expect(skull).toBeTruthy();
    });

    it('should update message when input changes', () => {
        component.message = 'First error';
        fixture.detectChanges();
        let messageElement = fixture.nativeElement.querySelector('.strong');
        expect(messageElement.textContent).toContain('First error');

        component.message = 'Second error';
        fixture.detectChanges();
        messageElement = fixture.nativeElement.querySelector('.strong');
        expect(messageElement.textContent).toContain('Second error');
    });
});
