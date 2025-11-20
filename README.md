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

The app now supports optional realtime updates using the Firebase SDK. When enabled in Settings, the app subscribes to the official Hacker News Firebase API and automatically displays new stories as they are posted without requiring a page refresh.

### Features

* **Live Updates**: New stories appear automatically at the top of the feed when realtime mode is enabled
* **Firebase Integration**: Uses the official Hacker News Firebase Realtime Database API
* **Settings Toggle**: Easy on/off control in the Settings panel
* **Offline Compatible**: Service Worker continues to provide offline support for cached content
* **Page-Specific**: Only active on the first page of feeds to optimize performance

### Usage

1. Open the Settings panel (gear icon)
2. Check the "Enable realtime story updates" checkbox
3. Return to the home feed
4. New stories will appear automatically without refreshing the page

### Technical Details

The realtime mode uses Firebase SDK to subscribe to story updates from `https://hacker-news.firebaseio.com/v0/`. When a new story is detected, it fetches the full story details and prepends it to the current feed. The feature is designed to work alongside the existing Service Worker implementation, ensuring offline reads remain functional.

## Areas of improvement

 - Realtime updating using the Firebase SDK (may need to add option to settings so service worker can still rely on REST endpoints)
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
