import { http, HttpResponse } from 'msw';
import { resolveFixture } from '../../../fixtures/resolve';

export const handlers = [
  http.get('https://node-hnapi.herokuapp.com/*', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') ?? undefined;
    const data = resolveFixture(url.pathname, page);
    if (data === null) {
      return HttpResponse.error();
    }
    return HttpResponse.json(data);
  }),
];
