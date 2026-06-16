import * as path from 'path';
import { capture } from './capture-lib';

const BASE_URL = process.env.ANGULAR_URL || 'http://localhost:4200';
const OUT_DIR = path.join(__dirname, 'screenshots', 'angular');

capture(BASE_URL, OUT_DIR).catch((err) => {
  console.error(err);
  process.exit(1);
});
