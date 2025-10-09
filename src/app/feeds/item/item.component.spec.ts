import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let mockSettingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    mockSettingsService = jasmine.createSpyObj('SettingsService', [], {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    });

    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService }
      ]
    });
    
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have settings from SettingsService', () => {
    expect(component.settings).toBe(mockSettingsService.settings);
  });

  it('should return true for hasUrl when item has valid http url', () => {
    component.item = {
      url: 'https://example.com',
      id: 1,
      title: 'Test',
      points: 10,
      user: 'testuser',
      time: 1234567890,
      time_ago: 1,
      comments_count: 5,
      type: 'link',
      domain: 'example.com',
      comments: [],
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    } as unknown as Story;
    expect(component.hasUrl).toBe(true);
  });

  it('should return false for hasUrl when item has no http url', () => {
    component.item = {
      url: 'item/123',
      id: 1,
      title: 'Test',
      points: 10,
      user: 'testuser',
      time: 1234567890,
      time_ago: 1,
      comments_count: 5,
      type: 'link',
      domain: '',
      comments: [],
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    } as unknown as Story;
    expect(component.hasUrl).toBe(false);
  });
});
