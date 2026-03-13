import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
    let component: ErrorMessageComponent;
    let fixture: ComponentFixture<ErrorMessageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ErrorMessageComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorMessageComponent);
        component = fixture.componentInstance;
        component.message = 'Test error message';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the error message', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.strong').textContent).toContain('Test error message');
    });

    it('should render error section', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.error-section')).toBeTruthy();
    });

    it('should render the skull element', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.skull')).toBeTruthy();
    });

    it('should render the head element', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.head')).toBeTruthy();
    });

    it('should render the mouth element', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.mouth')).toBeTruthy();
    });

    it('should render offline message text', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.textContent).toContain('offline');
    });

    it('should update message when input changes', () => {
        component.message = 'New error';
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.strong').textContent).toContain('New error');
    });

    it('should call ngOnInit without errors', () => {
        expect(() => component.ngOnInit()).not.toThrow();
    });
});
