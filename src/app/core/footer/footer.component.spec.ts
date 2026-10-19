import { ComponentFixture, TestBed, async } from '@angular/core/testing';

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

  it('should render a GitHub link that opens safely in a new tab', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('#footer a');

    expect(link.textContent).toContain('GitHub');
    expect(link.getAttribute('href')).toBe('https://github.com/hdjirdeh/angular2-hn');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });
});
