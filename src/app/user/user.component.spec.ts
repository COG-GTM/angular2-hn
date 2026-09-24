import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, Subject } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let routeParams: Subject<any>;

  const makeUser = (overrides: Partial<User> = {}): User =>
    ({ id: 'pg', created: '2 years ago', karma: 1500, about: '', ...overrides } as User);

  beforeEach(async(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    apiService.fetchUser.and.returnValue(of(makeUser()));
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    routeParams = new Subject<any>();

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: routeParams.asObservable() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => fixture.detectChanges());

    it('should not fetch until a route param is emitted', () => {
      expect(apiService.fetchUser).not.toHaveBeenCalled();
      expect(component.user).toBeUndefined();
    });

    it('should fetch the user for the id route param', () => {
      routeParams.next({ id: 'pg' });
      expect(apiService.fetchUser).toHaveBeenCalledWith('pg');
    });

    it('should store the fetched user', () => {
      const user = makeUser({ id: 'dang', karma: 42 });
      apiService.fetchUser.and.returnValue(of(user));
      routeParams.next({ id: 'dang' });
      expect(component.user).toEqual(user);
      expect(component.errorMessage).toBe('');
    });

    it('should set errorMessage when the fetch fails', () => {
      apiService.fetchUser.and.returnValue(throwError(new Error('boom')));
      routeParams.next({ id: 'nobody' });
      expect(component.user).toBeUndefined();
      expect(component.errorMessage).toBe('Could not load user nobody.');
    });

    it('should refetch when the id param changes', () => {
      routeParams.next({ id: 'pg' });
      routeParams.next({ id: 'dang' });
      expect(apiService.fetchUser).toHaveBeenCalledTimes(2);
      expect(apiService.fetchUser).toHaveBeenCalledWith('dang');
    });
  });

  describe('goBack', () => {
    it('should navigate back through Location', () => {
      component.goBack();
      expect(location.back).toHaveBeenCalledTimes(1);
    });
  });

  describe('template', () => {
    beforeEach(() => fixture.detectChanges());

    const query = (selector: string) => fixture.nativeElement.querySelector(selector);

    it('should show the loader before the user arrives', () => {
      expect(query('app-loader')).toBeTruthy();
      expect(query('app-error-message')).toBeNull();
      expect(query('.profile')).toBeNull();
    });

    it('should render the profile once the user is loaded', () => {
      apiService.fetchUser.and.returnValue(of(makeUser({ id: 'pg', karma: 1500, created: '2 years ago' })));
      routeParams.next({ id: 'pg' });
      fixture.detectChanges();
      expect(query('app-loader')).toBeNull();
      expect(query('app-error-message')).toBeNull();
      expect(query('.profile')).toBeTruthy();
      expect(query('.title-block').textContent).toContain('Profile: pg');
      expect(query('.name').textContent).toBe('pg');
      expect(query('.right').textContent).toContain('1500');
      expect(query('.age').textContent).toBe('Created 2 years ago');
    });

    it('should render the about section only when present', () => {
      apiService.fetchUser.and.returnValue(of(makeUser({ about: '<b>Hello</b>' })));
      routeParams.next({ id: 'pg' });
      fixture.detectChanges();
      expect(query('.other-details')).toBeTruthy();
      expect(query('.other-details p').innerHTML).toBe('<b>Hello</b>');

      apiService.fetchUser.and.returnValue(of(makeUser({ about: '' })));
      routeParams.next({ id: 'pg' });
      fixture.detectChanges();
      expect(query('.other-details')).toBeNull();
    });

    it('should show the error message on failure', () => {
      apiService.fetchUser.and.returnValue(throwError(new Error('boom')));
      routeParams.next({ id: 'nobody' });
      fixture.detectChanges();
      expect(query('app-loader')).toBeNull();
      expect(query('app-error-message')).toBeTruthy();
      expect(query('.profile')).toBeNull();
    });

    it('should call goBack when the back button is clicked', () => {
      routeParams.next({ id: 'pg' });
      fixture.detectChanges();
      query('.back-button').click();
      expect(location.back).toHaveBeenCalledTimes(1);
    });
  });
});
