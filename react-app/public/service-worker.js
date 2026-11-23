// Older versions of the app (before the Angular 9 upgrade) registered /service-worker.js (sw-precache).
// Retire those installs the same way as the Angular service worker.
importScripts('/ngsw-worker.js');
