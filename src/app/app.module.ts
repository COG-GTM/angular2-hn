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
import { SettingsService } from './shared/services/settings.service';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { FirebaseService } from './shared/services/firebase.service';

@NgModule({
    declarations: [AppComponent, FeedComponent, ItemComponent],
    imports: [
        BrowserModule.withServerTransition({ appId: 'angular-hnpwa' }),
        routing,
        CoreModule,
        SharedComponentsModule,
        PipesModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
        }),
    ],
    providers: [HackerNewsAPIService, SettingsService, FirebaseService],
    bootstrap: [AppComponent],
})
export class AppModule {}
