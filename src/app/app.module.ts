import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { routing } from './app.routes';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { FeedComponent } from './feeds/feed/feed.component';
import { ItemComponent } from './feeds/item/item.component';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { PipesModule } from './shared/pipes/pipes.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HackerNewsAPIService } from './shared/services/hackernews-api.service';
import { FirebaseAPIService } from './shared/services/firebase-api.service';
import { APIService } from './shared/services/api.service';
import { SettingsService } from './shared/services/settings.service';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';

@NgModule({
    declarations: [AppComponent, FeedComponent, ItemComponent],
    imports: [
        BrowserModule,
        routing,
        CoreModule,
        SharedComponentsModule,
        PipesModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
        }),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
    ],
    providers: [HackerNewsAPIService, FirebaseAPIService, APIService, SettingsService],
    bootstrap: [AppComponent],
})
export class AppModule {}
