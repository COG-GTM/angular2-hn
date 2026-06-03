import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent],
    });
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and renders the GitHub link', () => {
    expect(component).toBeTruthy();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.href).toContain('github.com');
  });
});
