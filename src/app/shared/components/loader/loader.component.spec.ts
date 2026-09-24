import { async, ComponentFixture, TestBed } from '@angular/core/testing';

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

  it('renders loading text', () => {
    expect(fixture.nativeElement.textContent).toContain('Loading...');
  });
});
