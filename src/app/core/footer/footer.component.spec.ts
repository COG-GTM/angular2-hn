import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
    let component: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FooterComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render footer div', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('#footer')).toBeTruthy();
    });

    it('should render GitHub link', () => {
        const compiled = fixture.debugElement.nativeElement;
        const link = compiled.querySelector('#footer a');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toContain('github.com');
    });

    it('should have target _blank on GitHub link', () => {
        const compiled = fixture.debugElement.nativeElement;
        const link = compiled.querySelector('#footer a');
        expect(link.getAttribute('target')).toBe('_blank');
    });

    it('should have rel noopener on GitHub link', () => {
        const compiled = fixture.debugElement.nativeElement;
        const link = compiled.querySelector('#footer a');
        expect(link.getAttribute('rel')).toBe('noopener');
    });

    it('should render footer text', () => {
        const compiled = fixture.debugElement.nativeElement;
        const paragraph = compiled.querySelector('#footer p');
        expect(paragraph.textContent).toContain('GitHub');
    });

    it('should call ngOnInit without errors', () => {
        expect(() => component.ngOnInit()).not.toThrow();
    });
});
