import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';
import { of, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let hackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
  let location: jasmine.SpyObj<Location>;
  let activatedRoute: any;
  let paramsSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    hackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
    location = jasmine.createSpyObj('Location', ['back']);

    paramsSubject = new BehaviorSubject({ id: 'testuser' });
    activatedRoute = {
      params: paramsSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      declarations: [ UserComponent ],
      providers: [
        { provide: HackerNewsAPIService, useValue: hackerNewsAPIService },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Location, useValue: location }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user data on ngOnInit', () => {
    const mockUser: User = {
      id: 'testuser',
      karma: 100,
      created: '2020-01-01',
      about: 'Test user bio'
    } as User;

    hackerNewsAPIService.fetchUser.and.returnValue(of(mockUser));

    fixture.detectChanges();

    expect(hackerNewsAPIService.fetchUser).toHaveBeenCalledWith('testuser');
    expect(component.user).toEqual(mockUser);
  });

  it('should handle different user IDs from route params', () => {
    const mockUser: User = { id: 'anotheruser', karma: 200 } as User;
    hackerNewsAPIService.fetchUser.and.returnValue(of(mockUser));

    paramsSubject.next({ id: 'anotheruser' });
    fixture.detectChanges();

    expect(hackerNewsAPIService.fetchUser).toHaveBeenCalledWith('anotheruser');
    expect(component.user).toEqual(mockUser);
  });

  it('should set errorMessage on fetch error', () => {
    hackerNewsAPIService.fetchUser.and.returnValue(throwError('Network error'));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load user testuser.');
  });

  it('should include user ID in error message', () => {
    hackerNewsAPIService.fetchUser.and.returnValue(throwError('Network error'));

    paramsSubject.next({ id: 'specificuser' });
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load user specificuser.');
  });

  it('should call location.back when goBack is called', () => {
    component.goBack();
    expect(location.back).toHaveBeenCalled();
  });
});
