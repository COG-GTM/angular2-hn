import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
    let component: ErrorMessageComponent;
    let fixture: ComponentFixture<ErrorMessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ErrorMessageComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorMessageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should accept message input', () => {
        component.message = 'Test error message';
        expect(component.message).toBe('Test error message');
    });

    it('should call ngOnInit without errors', () => {
        expect(() => component.ngOnInit()).not.toThrow();
    });
});
