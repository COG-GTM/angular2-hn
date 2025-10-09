import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
  let mockActivatedRoute: any;
  let mockLocation: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    
    mockActivatedRoute = {
      params: of({ id: '12345' })
    };

    await TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Location, useValue: mockLocation }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch item content on init', () => {
    const mockStory: Story = {
      id: 12345,
      title: 'Test Story',
      points: 100,
      user: 'testuser',
      time_ago: '1 hour ago',
      comments_count: 10,
      comments: []
    } as Story;
    
    mockHackerNewsAPIService.fetchItemContent.and.returnValue(of(mockStory));
    
    fixture.detectChanges();
    
    expect(mockHackerNewsAPIService.fetchItemContent).toHaveBeenCalledWith(12345);
    expect(component.item).toEqual(mockStory);
  });

  it('should set error message on fetch failure', () => {
    mockHackerNewsAPIService.fetchItemContent.and.returnValue(throwError(() => new Error('Network error')));
    
    fixture.detectChanges();
    
    expect(component.errorMessage).toBe('Item could not be loaded.');
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    
    expect(mockLocation.back).toHaveBeenCalled();
  });
});
