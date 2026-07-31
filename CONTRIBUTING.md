# Contributing

Thanks for your interest in improving this app!

## Setup

```sh
git clone https://github.com/COG-GTM/angular2-hn.git
cd angular2-hn
npm install
npm run dev
```

The dev server runs on [http://localhost:4200](http://localhost:4200).

## Before Opening a Pull Request

```sh
npm run lint        # ESLint (flat config, zero warnings allowed)
npm run typecheck   # tsc --noEmit
npm run build       # type-check + production build
npm run preview     # verify the built app, including the service worker
```

## Conventions

- Function components and hooks; no class components.
- TypeScript strict mode — avoid `any`.
- Component styles live next to the component as a `.scss` file, scoped under the component's root class.
- Shared theme tokens and media query helpers belong in `src/styles/`.
