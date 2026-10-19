import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NEVER, Observable, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let element: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;

  const user = { id: 'pg', karma: 157236, created: '19 years ago', about: '<p>Bug fixer.</p>' } as User;

  function render(response: Observable<User>) {
    api.fetchUser.and.returnValue(response);
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(async(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'pg' }) } },
        { provide: Location, useValue: location },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  it('should create and fetch the user from the route id', () => {
    render(of(user));

    expect(component).toBeTruthy();
    expect(api.fetchUser).toHaveBeenCalledWith('pg');
  });

  it('should render the profile details', () => {
    render(of(user));

    expect(element.querySelector('.title-block').textContent).toContain('Profile: pg');
    expect(element.querySelector('.main-details .name').textContent).toBe('pg');
    expect(element.querySelector('.main-details .right').textContent).toBe('157236 ★');
    expect(element.querySelector('.age').textContent).toBe('Created 19 years ago');
    expect(element.querySelector('.other-details p').innerHTML).toContain('Bug fixer.');
  });

  it('should hide the about section when the user has none', () => {
    render(of({ ...user, about: undefined }));

    expect(element.querySelector('.other-details')).toBeNull();
  });

  it('should show the loader while the user is loading', () => {
    render(NEVER);

    expect(element.querySelector('app-loader')).not.toBeNull();
    expect(element.querySelector('.profile')).toBeNull();
  });

  it('should show an error message when the user fails to load', () => {
    render(throwError(new Error('offline')));

    expect(component.errorMessage).toBe('Could not load user pg.');
    expect(element.querySelector('app-error-message')).not.toBeNull();
  });

  it('should navigate back when the back button is clicked', () => {
    render(of(user));

    element.querySelector<HTMLElement>('.back-button').click();

    expect(location.back).toHaveBeenCalled();
  });
});
