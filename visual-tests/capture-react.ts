import * as path from 'path';
import { capture } from './capture-lib';

const BASE_URL = process.env.REACT_URL || 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, 'screenshots', 'react');

capture(BASE_URL, OUT_DIR).catch((err) => {
  console.error(err);
  process.exit(1);
});
