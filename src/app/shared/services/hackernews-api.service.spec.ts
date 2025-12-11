import { TestBed } from '@angular/core/testing';
import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
    let service: HackerNewsAPIService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [HackerNewsAPIService],
        });

        service = TestBed.inject(HackerNewsAPIService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have a baseUrl', () => {
        expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
    });

    describe('fetchFeed', () => {
        it('should return an Observable', () => {
            const result = service.fetchFeed('news', 1);
            expect(result).toBeDefined();
            expect(result.subscribe).toBeDefined();
        });

        it('should be callable with different feed types', () => {
            const newsResult = service.fetchFeed('news', 1);
            const newestResult = service.fetchFeed('newest', 1);
            const showResult = service.fetchFeed('show', 1);
            const askResult = service.fetchFeed('ask', 1);
            const jobsResult = service.fetchFeed('jobs', 1);

            expect(newsResult).toBeDefined();
            expect(newestResult).toBeDefined();
            expect(showResult).toBeDefined();
            expect(askResult).toBeDefined();
            expect(jobsResult).toBeDefined();
        });

        it('should be callable with different page numbers', () => {
            const page1 = service.fetchFeed('news', 1);
            const page2 = service.fetchFeed('news', 2);
            const page10 = service.fetchFeed('news', 10);

            expect(page1).toBeDefined();
            expect(page2).toBeDefined();
            expect(page10).toBeDefined();
        });
    });

    describe('fetchItemContent', () => {
        it('should return an Observable', () => {
            const result = service.fetchItemContent(12345);
            expect(result).toBeDefined();
            expect(result.subscribe).toBeDefined();
        });

        it('should be callable with different item IDs', () => {
            const item1 = service.fetchItemContent(1);
            const item2 = service.fetchItemContent(999999);

            expect(item1).toBeDefined();
            expect(item2).toBeDefined();
        });
    });

    describe('fetchPollContent', () => {
        it('should return an Observable', () => {
            const result = service.fetchPollContent(12345);
            expect(result).toBeDefined();
            expect(result.subscribe).toBeDefined();
        });
    });

    describe('fetchUser', () => {
        it('should return an Observable', () => {
            const result = service.fetchUser('testuser');
            expect(result).toBeDefined();
            expect(result.subscribe).toBeDefined();
        });

        it('should be callable with different user IDs', () => {
            const user1 = service.fetchUser('pg');
            const user2 = service.fetchUser('dang');

            expect(user1).toBeDefined();
            expect(user2).toBeDefined();
        });
    });
});
