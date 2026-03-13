import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
    let component: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FooterComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render the footer div', () => {
        const compiled = fixture.nativeElement;
        const footerDiv = compiled.querySelector('#footer');
        expect(footerDiv).toBeTruthy();
    });

    it('should contain a link to GitHub', () => {
        const compiled = fixture.nativeElement;
        const link = compiled.querySelector('a');
        expect(link).toBeTruthy();
        expect(link.href).toContain('github.com');
        expect(link.target).toBe('_blank');
    });

    it('should display the correct text', () => {
        const compiled = fixture.nativeElement;
        const paragraph = compiled.querySelector('p');
        expect(paragraph.textContent).toContain('GitHub');
    });
});
