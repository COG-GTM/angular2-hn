import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('ItemComponent', () => {
  const settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      providers: [
        {provide: SettingsService, useValue: {settings}}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('binds settings and detects external URLs', () => {
    const component = TestBed.createComponent(ItemComponent).componentInstance;

    component.item = {url: 'https://x'} as any;
    expect(component.settings).toBe(settings);
    expect(component.hasUrl).toBe(true);
    component.item = {url: 'item?id=1'} as any;
    expect(component.hasUrl).toBe(false);
  });
});
