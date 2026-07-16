import { http, HttpResponse } from 'msw';
import { BASE_URL } from '../api/hackernews';
import { itemWithComments, pollItem, pollOption1, pollOption2, sampleUser, makeStoryList } from './fixtures';

export const handlers = [
    http.get(`${BASE_URL}/item/500`, () => HttpResponse.json(itemWithComments)),
    http.get(`${BASE_URL}/item/600`, () => HttpResponse.json(pollItem)),
    http.get(`${BASE_URL}/item/601`, () => HttpResponse.json(pollOption1)),
    http.get(`${BASE_URL}/item/602`, () => HttpResponse.json(pollOption2)),
    http.get(`${BASE_URL}/user/alice`, () => HttpResponse.json(sampleUser)),
    http.get(`${BASE_URL}/user/:id`, ({ params }) =>
        HttpResponse.json({ ...sampleUser, id: params.id as string })
    ),
    http.get(`${BASE_URL}/item/:id`, ({ params }) =>
        HttpResponse.json({ ...itemWithComments, id: Number(params.id) })
    ),
    http.get(`${BASE_URL}/:feedType`, () => HttpResponse.json(makeStoryList(30))),
];
