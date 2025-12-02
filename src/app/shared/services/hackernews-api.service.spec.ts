import { TestBed } from '@angular/core/testing';
import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
    let service: HackerNewsAPIService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [HackerNewsAPIService]
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
            expect(result).toBeTruthy();
            expect(typeof result.subscribe).toBe('function');
        });
    });

    describe('fetchItemContent', () => {
        it('should return an Observable', () => {
            const result = service.fetchItemContent(123);
            expect(result).toBeTruthy();
            expect(typeof result.subscribe).toBe('function');
        });
    });

    describe('fetchPollContent', () => {
        it('should return an Observable', () => {
            const result = service.fetchPollContent(123);
            expect(result).toBeTruthy();
            expect(typeof result.subscribe).toBe('function');
        });
    });

    describe('fetchUser', () => {
        it('should return an Observable', () => {
            const result = service.fetchUser('testuser');
            expect(result).toBeTruthy();
            expect(typeof result.subscribe).toBe('function');
        });
    });
});
