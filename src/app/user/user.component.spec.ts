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

  it('should fetch user with all profile fields', () => {
    const mockUser = {
      id: 'testuser',
      created: '2020-01-01',
      karma: 1500,
      about: 'Test user bio',
      avg: 0.5
    };
    mockHNService.fetchUser.and.returnValue(of(mockUser as any));
    
    component.ngOnInit();
    
    expect(component.user).toEqual(mockUser as any);
    expect(component.user.karma).toBe(1500);
    expect(component.user.about).toBe('Test user bio');
  });

  it('should handle user without karma', () => {
    const mockUser = {
      id: 'newuser',
      created: '2024-01-01',
      karma: 0
    };
    mockHNService.fetchUser.and.returnValue(of(mockUser as any));
    
    component.ngOnInit();
    
    expect(component.user.karma).toBe(0);
  });

  it('should handle user without about section', () => {
    const mockUser = {
      id: 'testuser',
      created: '2020-01-01',
      karma: 100,
      about: ''
    };
    mockHNService.fetchUser.and.returnValue(of(mockUser as any));
    
    component.ngOnInit();
    
    expect(component.user.about).toBe('');
  });

  it('should handle different route parameters', () => {
    mockActivatedRoute = {
      params: of({ id: 'anotheruser' })
    };
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
    
    const newFixture = TestBed.createComponent(UserComponent);
    const newComponent = newFixture.componentInstance;
    
    const mockUser = { id: 'anotheruser', created: '2021-01-01', karma: 50 };
    mockHNService.fetchUser.and.returnValue(of(mockUser as any));
    
    newComponent.ngOnInit();
    
    expect(mockHNService.fetchUser).toHaveBeenCalledWith('anotheruser');
    expect(newComponent.user.id).toBe('anotheruser');
  });

  it('should include username in error message', () => {
    const username = 'nonexistent';
    mockActivatedRoute = {
      params: of({ id: username })
    };
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
    
    const newFixture = TestBed.createComponent(UserComponent);
    const newComponent = newFixture.componentInstance;
    
    mockHNService.fetchUser.and.returnValue(throwError(() => new Error('Not found')));
    
    newComponent.ngOnInit();
    
    expect(newComponent.errorMessage).toContain(username);
  });
});
