import { provideHttpClient, withFetch } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideServiceWorker('ngsw-worker.js', { enabled: environment.production }),
  ],
}).catch((err) => console.error(err));
