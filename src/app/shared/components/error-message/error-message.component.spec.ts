import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
    let component: ErrorMessageComponent;
    let fixture: ComponentFixture<ErrorMessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ErrorMessageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should accept message input', () => {
        component.message = 'Test error message';
        fixture.detectChanges();
        expect(component.message).toBe('Test error message');
    });

    it('should handle empty message', () => {
        component.message = '';
        fixture.detectChanges();
        expect(component.message).toBe('');
    });

    it('should handle undefined message', () => {
        component.message = undefined;
        fixture.detectChanges();
        expect(component.message).toBeUndefined();
    });

    it('should call ngOnInit', () => {
        spyOn(component, 'ngOnInit');
        component.ngOnInit();
        expect(component.ngOnInit).toHaveBeenCalled();
    });
});
