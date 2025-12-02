import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
    let component: LoaderComponent;
    let fixture: ComponentFixture<LoaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LoaderComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(LoaderComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call ngOnInit without errors', () => {
        expect(() => component.ngOnInit()).not.toThrow();
    });
});
