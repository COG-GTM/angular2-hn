import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  const settingsStub = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      imports: [RouterTestingModule, PipesModule],
      providers: [
        {
          provide: SettingsService,
          useValue: {
            settings: settingsStub,
            toggleSettings: jasmine.createSpy('toggleSettings'),
            toggleOpenLinksInNewTab: jasmine.createSpy('toggleOpenLinksInNewTab'),
            setTheme: jasmine.createSpy('setTheme'),
            setFont: jasmine.createSpy('setFont'),
            setSpacing: jasmine.createSpy('setSpacing')
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = { id: 1, title: 'item', url: 'https://example.com' } as Story;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the settings from the service', () => {
    expect(component.settings).toEqual(settingsStub as any);
  });

  it('should report hasUrl true for http urls', () => {
    expect(component.hasUrl).toBe(true);
  });

  it('should report hasUrl false for relative urls', () => {
    component.item = { id: 1, url: 'item?id=1' } as Story;
    expect(component.hasUrl).toBe(false);
  });
});
