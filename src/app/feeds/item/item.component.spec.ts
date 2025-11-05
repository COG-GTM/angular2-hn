import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let settingsService: jasmine.SpyObj<SettingsService>;
  let mockSettings: Settings;

  beforeEach(async () => {
    mockSettings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };

    settingsService = jasmine.createSpyObj('SettingsService', []);
    settingsService.settings = mockSettings;

    await TestBed.configureTestingModule({
      declarations: [ ItemComponent ],
      providers: [
        { provide: SettingsService, useValue: settingsService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize settings from service', () => {
    expect(component.settings).toEqual(mockSettings);
  });

  it('should accept item input', () => {
    const mockItem: Story = {
      id: 1,
      title: 'Test Story',
      url: 'http://example.com',
      points: 100,
      user: 'testuser',
      time: 123456,
      comments_count: 10
    } as Story;

    component.item = mockItem;
    expect(component.item).toEqual(mockItem);
  });

  it('should call ngOnInit without errors', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should return true for hasUrl when url starts with http', () => {
    component.item = { url: 'http://example.com' } as Story;
    expect(component.hasUrl).toBe(true);
  });

  it('should return true for hasUrl when url starts with https', () => {
    component.item = { url: 'https://example.com' } as Story;
    expect(component.hasUrl).toBe(true);
  });

  it('should return false for hasUrl when url does not start with http', () => {
    component.item = { url: 'item?id=123' } as Story;
    expect(component.hasUrl).toBe(false);
  });
});
