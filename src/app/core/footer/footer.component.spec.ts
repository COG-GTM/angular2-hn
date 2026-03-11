import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
    let component: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FooterComponent],
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
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('#footer')).toBeTruthy();
    });

    it('should contain a GitHub link', () => {
        const compiled = fixture.nativeElement;
        const link = compiled.querySelector('a');
        expect(link).toBeTruthy();
        expect(link.href).toContain('github.com');
        expect(link.target).toBe('_blank');
    });

    it('should have text about showing love', () => {
        const compiled = fixture.nativeElement;
        const paragraph = compiled.querySelector('p');
        expect(paragraph.textContent).toContain('GitHub');
    });
});
