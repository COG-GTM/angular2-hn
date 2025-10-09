import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { of, throwError } from 'rxjs';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let hackerNewsServiceSpy: jasmine.SpyObj<HackerNewsAPIService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let activatedRouteSpy: any;

  beforeEach(async () => {
    const hnSpy = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
    const locSpy = jasmine.createSpyObj('Location', ['back']);
    activatedRouteSpy = {
      params: of({ id: 'testuser' })
    };

    await TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: hnSpy },
        { provide: Location, useValue: locSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    hackerNewsServiceSpy = TestBed.inject(HackerNewsAPIService) as jasmine.SpyObj<HackerNewsAPIService>;
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user data on init', () => {
    const mockUser = { id: 'testuser', created: '2020-01-01', karma: 100 };
    hackerNewsServiceSpy.fetchUser.and.returnValue(of(mockUser as any));

    fixture.detectChanges();

    expect(hackerNewsServiceSpy.fetchUser).toHaveBeenCalledWith('testuser');
    expect(component.user).toEqual(mockUser as any);
  });

  it('should handle errors when fetching user', () => {
    hackerNewsServiceSpy.fetchUser.and.returnValue(throwError(() => new Error('API Error')));

    fixture.detectChanges();

    expect(component.errorMessage).toBeTruthy();
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});
