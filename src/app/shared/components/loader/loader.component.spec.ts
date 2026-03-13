import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
    let component: LoaderComponent;
    let fixture: ComponentFixture<LoaderComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LoaderComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(LoaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render loading section', () => {
        const compiled = fixture.nativeElement;
        const loadingSection = compiled.querySelector('.loading-section');
        expect(loadingSection).toBeTruthy();
    });

    it('should render loader element', () => {
        const compiled = fixture.nativeElement;
        const loader = compiled.querySelector('.loader');
        expect(loader).toBeTruthy();
    });

    it('should display Loading text', () => {
        const compiled = fixture.nativeElement;
        const loader = compiled.querySelector('.loader');
        expect(loader.textContent).toContain('Loading...');
    });
});
