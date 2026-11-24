import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { routing } from './app.routes';

import { AppComponent } from './app.component';

import { FeedComponent } from './feeds/feed/feed.component';
import { ItemComponent } from './feeds/item/item.component';


import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HackerNewsAPIService } from './shared/services/hackernews-api.service';
import { SettingsService } from './shared/services/settings.service';

@NgModule({
    declarations: [AppComponent],
    imports: [
    BrowserModule,
    routing,
    ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: environment.production,
    }),
    FeedComponent, ItemComponent,
],
    providers: [HackerNewsAPIService, SettingsService],
    bootstrap: [AppComponent],
})
export class AppModule {}
