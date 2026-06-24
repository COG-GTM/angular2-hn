<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="React HN" title="React HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React + TypeScript
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

---

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** Built with Vite + vite-plugin-pwa for optimal performance.

## Mobile Preview

<p align="center">
  <img src = "http://i.imgur.com/ZloA1hn.gif">
</p>

## Laptop Preview

<p align="center">
  <img src = "http://i.imgur.com/MrKHaln.gif">
</p>

## Offline Support

This app uses [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) to generate a service worker as part of the build step to load quickly and work offline.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), React HN includes a Web App Manifest that allows you to install to your homescreen.

## Themes

Built in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

More to come!

## Stack

- **React 18** + **TypeScript**
- **Vite** for bundling and dev server
- **react-router-dom v6** for client-side routing
- **vite-plugin-pwa** (Workbox) for service worker and PWA support
- **SCSS** for styling (reused from original Angular project)
- **Firebase Hosting** for deployment

## Build process

 - Clone or download the repo
 - `npm install`
 - `npm run dev` to run the development server
 - `npm run build` to create a production build (output in `dist/`)
 - `npm run preview` to preview the production build locally

Note: Service Worker is only active in production builds. To test PWA/SW features:
 - `npm run build`
 - `npm run preview`

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
