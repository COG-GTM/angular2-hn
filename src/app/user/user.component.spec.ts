import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;

  beforeEach(async () => {
    const mockUser = {
      id: 'test',
      crated_time: 1234567890,
      created: '2 years ago',
      karma: 1000,
      avg: 10,
      about: 'Test user'
    };
    
    mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
    mockHackerNewsAPIService.fetchUser.and.returnValue(of(mockUser));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [UserComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 'test' }),
            snapshot: { params: { id: 'test' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have user property', () => {
    expect(component.user).toBeDefined();
  });
});
