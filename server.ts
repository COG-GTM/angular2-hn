import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist/angular-hnpwa');

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModule,
}));

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

app.get('*.*', express.static(DIST_FOLDER, {
  maxAge: '1y'
}));

app.get('*', (req, res) => {
  res.render('index', { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
});

app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
