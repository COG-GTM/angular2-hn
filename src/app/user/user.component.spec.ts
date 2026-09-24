import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let fixture: ComponentFixture<UserComponent>;
  let component: UserComponent;
  let el: HTMLElement;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;

  const user: User = {
    id: 'pg',
    crated_time: 0,
    created: '10 years ago',
    karma: 1234,
    avg: 0,
    about: '<p>Founder</p>',
  };

  beforeEach(async(() => {
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
    location = jasmine.createSpyObj('Location', ['back']);

    TestBed.configureTestingModule({
      declarations: [UserComponent, LoaderComponent, ErrorMessageComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: { params: new BehaviorSubject({ id: 'pg' }) } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  it('loads and renders the user profile', () => {
    api.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();

    expect(api.fetchUser).toHaveBeenCalledWith('pg');
    expect(component.user).toEqual(user);
    expect(el.querySelector('.name').textContent).toContain('pg');
    expect(el.querySelector('.right').textContent).toContain('1234');
    expect(el.querySelector('.other-details').textContent).toContain('Founder');
  });

  it('omits the about section when empty', () => {
    api.fetchUser.and.returnValue(of({ ...user, about: '' }));
    fixture.detectChanges();
    expect(el.querySelector('.other-details')).toBeNull();
  });

  it('shows an error when the user cannot be loaded', () => {
    api.fetchUser.and.returnValue(throwError(new Error('x')));
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load user pg.');
    expect(el.querySelector('app-error-message')).not.toBeNull();
  });

  it('shows the loader while waiting', () => {
    api.fetchUser.and.returnValue(NEVER);
    fixture.detectChanges();
    expect(el.querySelector('app-loader')).not.toBeNull();
  });

  it('navigates back', () => {
    api.fetchUser.and.returnValue(of(user));
    fixture.detectChanges();
    (el.querySelector('.back-button') as HTMLElement).click();
    expect(location.back).toHaveBeenCalled();
  });
});
