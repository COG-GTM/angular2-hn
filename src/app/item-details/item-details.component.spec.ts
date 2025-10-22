import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;

  beforeEach(async () => {
    const mockStory = {
      id: 1,
      title: 'Test',
      points: 100,
      user: 'testuser',
      time: 1234567890,
      time_ago: 123456,
      type: 'news' as any,
      url: 'https://test.com',
      domain: 'test.com',
      comments: [],
      comments_count: 0,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    };
    
    mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    mockHackerNewsAPIService.fetchItemContent.and.returnValue(of(mockStory));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemDetailsComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
            snapshot: { params: { id: '1' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have item property', () => {
    expect(component.item).toBeDefined();
  });
});
