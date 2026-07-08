// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
const context = (import.meta as unknown as {
  webpackContext(
    request: string,
    options: {
      recursive: boolean;
      regExp: RegExp;
    }
  ): {
    keys(): string[];
    (id: string): unknown;
  };
}).webpackContext('./', {
  recursive: true,
  regExp: /\.spec\.ts$/
});
// And load the modules.
context.keys().map(context);
