import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [FooterComponent] });
    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the GitHub link opening safely in a new tab', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#footer').textContent).toContain('Show this project some ❤ on GitHub');
    const link = el.querySelector('a');
    expect(link.getAttribute('href')).toBe('https://github.com/hdjirdeh/angular2-hn');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });
});
