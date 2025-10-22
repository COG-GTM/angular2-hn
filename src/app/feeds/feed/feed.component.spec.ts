import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;

  beforeEach(async () => {
    mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
    mockHackerNewsAPIService.fetchFeed.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ page: '1' }),
            snapshot: { params: { page: '1' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have items array', () => {
    expect(component.items).toBeDefined();
    expect(Array.isArray(component.items)).toBeTruthy();
  });

  it('should have pageNum property', () => {
    expect(component.pageNum).toBeDefined();
  });
});
