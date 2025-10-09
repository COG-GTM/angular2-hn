import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;

  beforeEach(async () => {
    const settingsSpy = jasmine.createSpyObj('SettingsService', []);
    settingsSpy.settings = { openLinkInNewTab: false };

    await TestBed.configureTestingModule({
      declarations: [ItemComponent],
      providers: [
        { provide: SettingsService, useValue: settingsSpy }
      ]
    }).compileComponents();

    settingsServiceSpy = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = {
      id: 1,
      title: 'Test Story',
      points: 100,
      user: 'testuser',
      time_ago: '1 hour ago',
      comments_count: 5,
      url: 'https://example.com'
    } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept item input', () => {
    fixture.detectChanges();
    expect(component.item).toBeDefined();
    expect(component.item.id).toBe(1);
  });

  it('should display item properties', () => {
    fixture.detectChanges();
    expect(component.item.title).toBe('Test Story');
    expect(component.item.points).toBe(100);
  });

  it('should have settings property from service', () => {
    fixture.detectChanges();
    expect(component.settings).toBeDefined();
  });
});
