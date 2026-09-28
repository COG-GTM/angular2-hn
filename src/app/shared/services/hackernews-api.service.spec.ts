import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

class FakeXMLHttpRequest {
    static requests: FakeXMLHttpRequest[] = [];

    method: string;
    url: string;
    status = 0;
    statusText = '';
    responseText = '';
    responseURL = '';
    withCredentials = false;
    onload: () => void;
    onerror: (err: any) => void;

    constructor() {
        FakeXMLHttpRequest.requests.push(this);
    }

    open(method: string, url: string) {
        this.method = method;
        this.url = url;
    }

    send() {}

    setRequestHeader() {}

    getAllResponseHeaders() {
        return '';
    }

    respond(body: any, status = 200) {
        this.status = status;
        this.responseURL = this.url;
        this.responseText = JSON.stringify(body);
        this.onload();
    }

    fail(err: any = new Error('network error')) {
        this.onerror(err);
    }
}

describe('HackerNewsAPIService', () => {
    const baseUrl = 'https://node-hnapi.herokuapp.com';
    let service: HackerNewsAPIService;
    let originalXHR: typeof XMLHttpRequest;

    const lastRequest = () => FakeXMLHttpRequest.requests[FakeXMLHttpRequest.requests.length - 1];

    beforeEach(() => {
        originalXHR = (window as any).XMLHttpRequest;
        (window as any).XMLHttpRequest = FakeXMLHttpRequest;
        FakeXMLHttpRequest.requests = [];

        TestBed.configureTestingModule({
            providers: [HackerNewsAPIService],
        });
        service = TestBed.inject(HackerNewsAPIService);
    });

    afterEach(() => {
        (window as any).XMLHttpRequest = originalXHR;
    });

    it('should target the node-hnapi base url', () => {
        expect(service.baseUrl).toBe(baseUrl);
    });

    it('should not issue a request until subscribed', () => {
        service.fetchFeed('news', 1);
        expect(FakeXMLHttpRequest.requests.length).toBe(0);
    });

    describe('fetchFeed', () => {
        it('should GET the feed page and emit the stories, then complete', fakeAsync(() => {
            const stories = [{ id: 1, title: 'First' }, { id: 2, title: 'Second' }] as Story[];
            let result: Story[];
            let completed = false;

            service.fetchFeed('newest', 3).subscribe(
                data => (result = data),
                fail,
                () => (completed = true)
            );

            expect(FakeXMLHttpRequest.requests.length).toBe(1);
            expect(lastRequest().method).toBe('get');
            expect(lastRequest().url).toBe(`${baseUrl}/newest?page=3`);

            lastRequest().respond(stories);
            flushMicrotasks();

            expect(result).toEqual(stories);
            expect(completed).toBe(true);
        }));

        it('should propagate network errors to the subscriber', fakeAsync(() => {
            let error: any;
            service.fetchFeed('news', 1).subscribe(fail, err => (error = err));

            const networkError = new Error('offline');
            lastRequest().fail(networkError);
            flushMicrotasks();

            expect(error).toBe(networkError);
        }));

        it('should not emit if unsubscribed before the response arrives', fakeAsync(() => {
            const next = jasmine.createSpy('next');
            const sub = service.fetchFeed('news', 1).subscribe(next);

            sub.unsubscribe();
            lastRequest().respond([{ id: 1 }]);
            flushMicrotasks();

            expect(next).not.toHaveBeenCalled();
        }));
    });

    describe('fetchUser', () => {
        it('should GET the user by id', fakeAsync(() => {
            const user = { id: 'pg', karma: 155000 } as User;
            let result: User;

            service.fetchUser('pg').subscribe(data => (result = data));
            expect(lastRequest().url).toBe(`${baseUrl}/user/pg`);

            lastRequest().respond(user);
            flushMicrotasks();

            expect(result).toEqual(user);
        }));
    });

    describe('fetchPollContent', () => {
        it('should GET the poll option item by id', fakeAsync(() => {
            const pollResult = { points: 12, content: 'Yes' } as PollResult;
            let result: PollResult;

            service.fetchPollContent(42).subscribe(data => (result = data));
            expect(lastRequest().url).toBe(`${baseUrl}/item/42`);

            lastRequest().respond(pollResult);
            flushMicrotasks();

            expect(result).toEqual(pollResult);
        }));
    });

    describe('fetchItemContent', () => {
        it('should GET the item and emit it unchanged for non-poll stories', fakeAsync(() => {
            const story = { id: 7, type: 'story', title: 'Hello' } as Story;
            let result: Story;

            service.fetchItemContent(7).subscribe(data => (result = data));
            expect(lastRequest().url).toBe(`${baseUrl}/item/7`);

            lastRequest().respond(story);
            flushMicrotasks();

            expect(result).toEqual(story);
            expect(FakeXMLHttpRequest.requests.length).toBe(1);
        }));

        it('should fetch every poll option and aggregate the vote count for polls', fakeAsync(() => {
            const poll = { id: 100, type: 'poll', poll: [{}, {}] } as Story;
            let result: Story;

            service.fetchItemContent(100).subscribe(data => (result = data));
            lastRequest().respond(poll);
            flushMicrotasks();

            const [, optionOne, optionTwo] = FakeXMLHttpRequest.requests;
            expect(FakeXMLHttpRequest.requests.length).toBe(3);
            expect(optionOne.url).toBe(`${baseUrl}/item/101`);
            expect(optionTwo.url).toBe(`${baseUrl}/item/102`);
            expect(result.poll_votes_count).toBe(0);

            optionOne.respond({ points: 5, content: 'Option A' });
            optionTwo.respond({ points: 15, content: 'Option B' });
            flushMicrotasks();

            expect(result.poll).toEqual([
                { points: 5, content: 'Option A' },
                { points: 15, content: 'Option B' },
            ]);
            expect(result.poll_votes_count).toBe(20);
        }));
    });
});
