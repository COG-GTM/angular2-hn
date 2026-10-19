import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [LoaderComponent] }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaderComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a loading indicator', () => {
    expect(fixture.nativeElement.querySelector('.loader').textContent).toContain('Loading...');
  });
});
