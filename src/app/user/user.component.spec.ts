import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { of, throwError } from 'rxjs';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let mockHNService: jasmine.SpyObj<HackerNewsAPIService>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockHNService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    mockActivatedRoute = {
      params: of({ id: 'testuser' })
    };

    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHNService },
        { provide: Location, useValue: mockLocation },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user data on init', () => {
    const mockUser = {
      id: 'testuser',
      created: '2020-01-01',
      karma: 100,
      about: 'Test user'
    };
    mockHNService.fetchUser.and.returnValue(of(mockUser as any));
    
    component.ngOnInit();
    
    expect(mockHNService.fetchUser).toHaveBeenCalledWith('testuser');
  });

  it('should handle error when fetching user fails', () => {
    mockHNService.fetchUser.and.returnValue(throwError(() => new Error('API Error')));
    
    component.ngOnInit();
    
    expect(component.errorMessage).toContain('Could not load user testuser');
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });
});
