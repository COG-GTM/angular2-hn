import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';


import { environment } from './environments/environment';
import { HackerNewsAPIService } from './app/shared/services/hackernews-api.service';
import { SettingsService } from './app/shared/services/settings.service';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { routing } from './app/app.routes';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection(),
        importProvidersFrom(BrowserModule, routing, ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
        })),
        HackerNewsAPIService, SettingsService,
    ]
})
  .catch(err => console.error(err));
