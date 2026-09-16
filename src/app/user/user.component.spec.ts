import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let apiService: { fetchUser: jasmine.Spy };
  let location: Location;

  beforeEach(() => {
    apiService = { fetchUser: jasmine.createSpy('fetchUser') };
    TestBed.configureTestingModule({
      declarations: [UserComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { params: of({ id: 'bob' }) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch the user on init', () => {
    const user = { id: 'bob', karma: 42 };
    apiService.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();
    expect(apiService.fetchUser).toHaveBeenCalledWith('bob');
    expect(component.user).toEqual(user as User);
  });

  it('should set errorMessage when fetching the user fails', () => {
    apiService.fetchUser.and.returnValue(throwError('boom'));
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Could not load user bob.');
  });

  it('should call Location.back on goBack', () => {
    const backSpy = spyOn(location, 'back');
    apiService.fetchUser.and.returnValue(of({ id: 'bob' }));
    fixture.detectChanges();
    component.goBack();
    expect(backSpy).toHaveBeenCalled();
  });
});
