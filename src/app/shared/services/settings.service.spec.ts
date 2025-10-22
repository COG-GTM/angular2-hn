import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingsService]
    });
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have settings object', () => {
    expect(service.settings).toBeDefined();
    expect(typeof service.settings).toBe('object');
  });

  it('should have default theme property', () => {
    expect(service.settings.theme).toBeDefined();
  });
});
