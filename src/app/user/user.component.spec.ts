import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
    
    mockActivatedRoute = {
      params: of({ id: 'testuser' })
    };

    await TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user on init', () => {
    const mockUser: User = {
      id: 'testuser',
      created: '2020-01-01',
      karma: 1000,
      about: 'Test user bio'
    } as User;
    
    mockHackerNewsAPIService.fetchUser.and.returnValue(of(mockUser));
    
    fixture.detectChanges();
    
    expect(mockHackerNewsAPIService.fetchUser).toHaveBeenCalledWith('testuser');
    expect(component.user).toEqual(mockUser);
  });

  it('should set error message on fetch failure', () => {
    mockHackerNewsAPIService.fetchUser.and.returnValue(throwError(() => new Error('Network error')));
    
    fixture.detectChanges();
    
    expect(component.errorMessage).toBe('User could not be loaded.');
  });
});
