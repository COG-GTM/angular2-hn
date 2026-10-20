import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let params: BehaviorSubject<any>;

  const user: User = {
    id: 'pg',
    crated_time: 1160418092,
    created: '18 years ago',
    karma: 157236,
    avg: 0,
    about: '<a href="http://paulgraham.com">Bug fixer.</a>',
  };

  beforeEach(() => {
    api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
    location = jasmine.createSpyObj<Location>('Location', ['back']);
    params = new BehaviorSubject({ id: 'pg' });

    TestBed.configureTestingModule({
      imports: [SharedComponentsModule],
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: ActivatedRoute, useValue: { params } },
        { provide: Location, useValue: location },
      ],
    });

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  function el(): HTMLElement {
    return fixture.nativeElement;
  }

  it('shows the loader while the profile is loading', () => {
    api.fetchUser.and.returnValue(new Subject<User>());
    fixture.detectChanges();
    expect(el().querySelector('app-loader')).toBeTruthy();
    expect(el().querySelector('.profile')).toBeNull();
  });

  it('fetches the user from the id route param', () => {
    api.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();
    expect(api.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toEqual(user);
  });

  it('renders the profile details', () => {
    api.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();

    expect(el().querySelector('.title-block').textContent).toContain('Profile: pg');
    expect(el().querySelector('.main-details .name').textContent).toBe('pg');
    expect(el().querySelector('.main-details .right').textContent).toBe('157236 ★');
    expect(el().querySelector('.age').textContent).toBe('Created 18 years ago');
    const about = el().querySelector('.other-details a');
    expect(about.textContent).toBe('Bug fixer.');
    expect(about.getAttribute('href')).toBe('http://paulgraham.com');
  });

  it('omits the about section when the user has none', () => {
    api.fetchUser.and.returnValue(of({ ...user, about: '' }));
    fixture.detectChanges();
    expect(el().querySelector('.other-details')).toBeNull();
  });

  it('loads a different user when the route changes', () => {
    api.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();
    params.next({ id: 'dang' });
    expect(api.fetchUser).toHaveBeenCalledWith('dang');
  });

  it('goes back when the back button is clicked', () => {
    api.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();
    (el().querySelector('.back-button') as HTMLElement).click();
    expect(location.back).toHaveBeenCalled();
  });

  it('shows an error message when the user cannot be loaded', () => {
    api.fetchUser.and.returnValue(throwError(new Error('404')));
    params.next({ id: 'ghost' });
    fixture.detectChanges();
    expect(el().querySelector('app-loader')).toBeNull();
    expect(el().querySelector('app-error-message').textContent).toContain('Could not load user ghost.');
  });
});
