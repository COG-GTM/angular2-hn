# React HN PWA

A progressive Hacker News client built with React, TypeScript, Vite, and
React Router. The app provides responsive feeds, item comments, user profiles,
theme settings, and offline support through Workbox and
`vite-plugin-pwa`.

## Development

Install dependencies and start the Vite development server:

```sh
npm ci
npm run dev
```

The application is available at `http://localhost:5173`.

## Build and preview

Create a production build and run the local preview server:

```sh
npm run build
npm run preview
```

The build output is written to `dist/` and includes the generated service
worker and web app manifest.

## Themes

The built-in themes are Default, Night, and Black (AMOLED). Settings also
control title font size, list spacing, and whether external links open in a
new tab.

## Offline support

Workbox, configured through `vite-plugin-pwa`, precaches the application shell
and static assets and provides SPA navigation fallback for offline visits.

## Credits

This project is based on the original Angular 2 HN application and its
contributors:

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

## License

See [LICENSE.md](LICENSE.md).
