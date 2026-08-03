import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('offers a saved link in the header navigation', () => {
    const links = fixture.debugElement.queryAll(By.css('.header-nav a'));
    const savedLink = links.find(link => link.nativeElement.textContent.trim() === 'saved');

    expect(savedLink).toBeTruthy();
    expect(savedLink.attributes.routerLink).toBe('/saved');
  });
});
