import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';

describe('UserComponent', () => {
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let route: any;
  const user = {id: 'pg', karma: 100} as any;

  beforeEach(() => {
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
    location = jasmine.createSpyObj('Location', ['back']);
    route = {params: of({id: 'pg'})};
    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        {provide: ActivatedRoute, useValue: route},
        {provide: HackerNewsAPIService, useValue: api},
        {provide: Location, useValue: location}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('loads a user', () => {
    api.fetchUser.and.returnValue(of(user));
    const component = TestBed.createComponent(UserComponent).componentInstance;

    component.ngOnInit();

    expect(api.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toBe(user);
  });

  it('sets an error message when the user fails', () => {
    api.fetchUser.and.returnValue(throwError('x'));
    const component = TestBed.createComponent(UserComponent).componentInstance;

    component.ngOnInit();

    expect(component.errorMessage).toBe('Could not load user pg.');
  });

  it('goes back in browser history', () => {
    const component = TestBed.createComponent(UserComponent).componentInstance;

    component.goBack();

    expect(location.back).toHaveBeenCalled();
  });
});
