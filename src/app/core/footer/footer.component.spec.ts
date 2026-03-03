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

    it('should render a footer with a GitHub link', () => {
        const compiled = fixture.nativeElement;
        const link = compiled.querySelector('a');
        expect(link.getAttribute('href')).toBe('https://github.com/hdjirdeh/angular2-hn');
        expect(link.getAttribute('target')).toBe('_blank');
    });
});
