# angular2-hn React app

React + TypeScript + Vite port of the Angular app in `../src`, built up over several PRs and moved to the repo root at cutover.

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint
npm run typecheck
npm test
npm run build
```

Feeds and items come from `node-hnapi.herokuapp.com`; user profiles come from `api.hnpwa.com` because node-hnapi's `/user/:id` returns 404.
