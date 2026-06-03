import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

function makeUser(partial: Partial<User>): User {
  const user = new User();
  Object.assign(user, { id: 'pg', karma: 100, created: 'long ago', about: '<p>hi</p>' });
  Object.assign(user, partial);
  return user;
}

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let apiSpy: jasmine.SpyObj<HackerNewsAPIService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let paramsSubject: Subject<any>;

  function configure() {
    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiSpy },
        { provide: Location, useValue: locationSpy },
        { provide: ActivatedRoute, useValue: { params: paramsSubject.asObservable() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
    locationSpy = jasmine.createSpyObj('Location', ['back']);
    paramsSubject = new Subject<any>();
  });

  it('loads the requested user', () => {
    apiSpy.fetchUser.and.returnValue(of(makeUser({ id: 'dang', karma: 200 })));
    configure();

    fixture.detectChanges();
    paramsSubject.next({ id: 'dang' });
    fixture.detectChanges();

    expect(apiSpy.fetchUser).toHaveBeenCalledWith('dang');
    expect(component.user.id).toBe('dang');
    expect(fixture.nativeElement.textContent).toContain('dang');
  });

  it('sets an error message when the user fails to load', () => {
    apiSpy.fetchUser.and.returnValue(throwError('boom'));
    configure();

    fixture.detectChanges();
    paramsSubject.next({ id: 'ghost' });

    expect(component.errorMessage).toBe('Could not load user ghost.');
  });

  it('navigates back via the Location service', () => {
    apiSpy.fetchUser.and.returnValue(of(makeUser({})));
    configure();
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});
