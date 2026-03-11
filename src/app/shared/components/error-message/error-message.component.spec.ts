import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
    let component: ErrorMessageComponent;
    let fixture: ComponentFixture<ErrorMessageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ErrorMessageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorMessageComponent);
        component = fixture.componentInstance;
        component.message = 'Something went wrong';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render the error message', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.strong').textContent).toContain('Something went wrong');
    });

    it('should render error section', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.error-section')).toBeTruthy();
    });

    it('should render skull element', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.skull')).toBeTruthy();
    });

    it('should have offline info text', () => {
        const compiled = fixture.nativeElement;
        const paragraphs = compiled.querySelectorAll('p');
        const offlineText = paragraphs[1].textContent;
        expect(offlineText).toContain('offline');
    });

    it('should accept message input', () => {
        component.message = 'New error message';
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.strong').textContent).toContain('New error message');
    });
});
