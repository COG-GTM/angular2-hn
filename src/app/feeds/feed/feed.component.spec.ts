import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedComponent } from './feed.component';
import { ActivatedRoute } from '@angular/router';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { of, throwError } from 'rxjs';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let hackerNewsServiceSpy: jasmine.SpyObj<HackerNewsAPIService>;
  let activatedRouteSpy: any;

  beforeEach(async () => {
    const hnSpy = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
    activatedRouteSpy = {
      params: of({ page: '1' }),
      data: of({ feedType: 'news' })
    };

    await TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: hnSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    hackerNewsServiceSpy = TestBed.inject(HackerNewsAPIService) as jasmine.SpyObj<HackerNewsAPIService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.pageNum).toBe(1);
    expect(component.listStart).toBe(0);
  });

  it('should fetch feed data on init', () => {
    const mockFeed = [{ id: 1, title: 'Test Story' }];
    hackerNewsServiceSpy.fetchFeed.and.returnValue(of(mockFeed as any));

    fixture.detectChanges();

    expect(hackerNewsServiceSpy.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('should handle different feed types', () => {
    activatedRouteSpy.data = of({ feedType: 'newest' });
    const mockFeed = [{ id: 1, title: 'Test Story' }];
    hackerNewsServiceSpy.fetchFeed.and.returnValue(of(mockFeed as any));

    fixture.detectChanges();

    expect(hackerNewsServiceSpy.fetchFeed).toHaveBeenCalledWith('newest', 1);
  });

  it('should handle errors when fetching feed', () => {
    hackerNewsServiceSpy.fetchFeed.and.returnValue(throwError(() => new Error('API Error')));

    fixture.detectChanges();

    expect(component.errorMessage).toBeTruthy();
  });

  it('should update page number from route params', () => {
    activatedRouteSpy.params = of({ page: '5' });
    const mockFeed = [{ id: 1, title: 'Test Story' }];
    hackerNewsServiceSpy.fetchFeed.and.returnValue(of(mockFeed as any));

    fixture.detectChanges();

    expect(component.pageNum).toBe(5);
  });
});
