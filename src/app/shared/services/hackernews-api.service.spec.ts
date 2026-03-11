import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

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

    it('should have correct baseUrl', () => {
        expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
    });

    describe('fetchFeed', () => {
        it('should return an Observable', () => {
            const result = service.fetchFeed('news', 1);
            expect(result).toBeTruthy();
            expect(result instanceof Observable).toBe(true);
        });

        it('should accept different feed types', () => {
            expect(service.fetchFeed('news', 1) instanceof Observable).toBe(true);
            expect(service.fetchFeed('show', 2) instanceof Observable).toBe(true);
            expect(service.fetchFeed('ask', 3) instanceof Observable).toBe(true);
            expect(service.fetchFeed('jobs', 1) instanceof Observable).toBe(true);
            expect(service.fetchFeed('newest', 1) instanceof Observable).toBe(true);
        });

        it('should be unsubscribable without error', () => {
            const result = service.fetchFeed('news', 1);
            const subscription = result.subscribe(() => {});
            expect(() => subscription.unsubscribe()).not.toThrow();
        });
    });

    describe('fetchItemContent', () => {
        it('should return an Observable', () => {
            const result = service.fetchItemContent(1);
            expect(result).toBeTruthy();
            expect(result instanceof Observable).toBe(true);
        });

        it('should be unsubscribable without error', () => {
            const result = service.fetchItemContent(1);
            const subscription = result.subscribe(() => {}, () => {});
            expect(() => subscription.unsubscribe()).not.toThrow();
        });
    });

    describe('fetchPollContent', () => {
        it('should return an Observable', () => {
            const result = service.fetchPollContent(1);
            expect(result).toBeTruthy();
            expect(result instanceof Observable).toBe(true);
        });

        it('should be unsubscribable without error', () => {
            const result = service.fetchPollContent(1);
            const subscription = result.subscribe(() => {});
            expect(() => subscription.unsubscribe()).not.toThrow();
        });
    });

    describe('fetchUser', () => {
        it('should return an Observable', () => {
            const result = service.fetchUser('testuser');
            expect(result).toBeTruthy();
            expect(result instanceof Observable).toBe(true);
        });

        it('should be unsubscribable without error', () => {
            const result = service.fetchUser('testuser');
            const subscription = result.subscribe(() => {}, () => {});
            expect(() => subscription.unsubscribe()).not.toThrow();
        });
    });
});
