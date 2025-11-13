<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with Angular
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
  <a href="https://travis-ci.org/housseindjirdeh/angular2-hn"><img alt="Build Status" src="https://travis-ci.org/housseindjirdeh/angular2-hn.svg?branch=master"></a>
</p>

---

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** [Lighthouse](https://github.com/GoogleChrome/lighthouse) score of 87/100.

<p align="center">
  <img src = "http://i.imgur.com/fzJzLFO.png" width=500>
</p>

## Mobile Preview

<p align="center">
  <img src = "http://i.imgur.com/ZloA1hn.gif">
</p>

## Laptop Preview

<p align="center">
  <img src = "http://i.imgur.com/MrKHaln.gif">
</p>

## Offline Support

This app uses [Workbox](https://workboxjs.org/) to generate a service worker as part of the build step to load quickly and work offline.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), Angular 2 HN includes a Web App Manifest that allows you to install to your homescreen.

<p align="center">
  <img src = "http://i.imgur.com/1RaaNkr.png">
</p>

## Themes

Built in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

More to come!

## Realtime Mode

The app now supports optional realtime updates using the Firebase SDK. When enabled in Settings, the app subscribes to Hacker News updates via Firebase and automatically displays new stories without requiring a page refresh.

### How to Enable

1. Click the settings icon in the header
2. Check the "Enable realtime updates" checkbox
3. Close the settings panel

New stories will now appear at the top of the feed automatically as they are posted to Hacker News. This feature only works on the first page of each feed and requires an active internet connection.

### Compatibility

Realtime mode is fully compatible with the Service Worker and offline functionality. When offline, the app will continue to use cached content from the Service Worker. Realtime updates only function when online and do not interfere with offline reads.

### Testing

To test the realtime updates feature, run the end-to-end test script:

```bash
npm start  # Start the development server
node e2e/realtime-updates.e2e.js  # Run the E2E test in another terminal
```

The test verifies that new stories can appear in the feed without triggering a page reload.

## Areas of improvement

 - Server side rendering

Feel free to send me feedback on [twitter](https://twitter.com/hdjirdeh) or [file an issue](https://github.com/hdjirdeh/angular2-hn/issues/new)! Feature requests are always welcome.

## Build process

Note: This project has been ejected (with AOT + production settings) in order to customize Webpack configurations.

 - Clone or download the repo
 - `npm install`
 - `npm start` to run the application with webpack-dev-server or `npm build` to kick off a fresh build and update the output directory (`dist/`)

Note: Any Service Worker changes will not be reflected when you run the application locally in development. To test service worker changes:
 - `npm build`
 - `npm run precache` to generate the service worker file
 - `npm run static-serve` to load the application along with the service worker asset using [live-server](https://github.com/tapio/live-server)

## Contributors

A million thanks to some awesome people :)

* [Ashwin Sureshkumar](https://github.com/ashwin-sureshkumar)
* [Mateusz](https://github.com/mateuszwitkowski)
* [Jordi Collell](https://github.com/jordic)
* [Ben Brooks](https://github.com/bbrks)
* [Zach Berger](https://github.com/zachberger)
* [blAck PR](https://github.com/blackpr)
* [Bram Borggreve](https://github.com/beeman)
* [Antonio Indrianjafy](https://github.com/Antogin)
* [Addy Osmani](https://github.com/addyosmani)
* [Majid Hajian](https://github.com/mhadaily)
* [Jeff Cross](https://github.com/jeffbcross)
* [Minko Gechev](https://github.com/mgechev)
