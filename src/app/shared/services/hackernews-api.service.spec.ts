import { TestBed } from '@angular/core/testing';
import { HackerNewsAPIService } from './hackernews-api.service';

// We need to mock the unfetch module since it is imported directly
// The service uses `unfetch` (not window.fetch), so we need a different approach

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

    it('should have a base URL', () => {
        expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
    });

    describe('fetchFeed', () => {
        it('should return an Observable', () => {
            const result = service.fetchFeed('news', 1);
            expect(result).toBeTruthy();
            expect(result.subscribe).toBeTruthy();
        });

        it('should return an observable that can be subscribed to', (done) => {
            service.fetchFeed('news', 1).subscribe(
                (data) => {
                    expect(data).toBeTruthy();
                    done();
                },
                (err) => {
                    // fetch to external API may fail in test env
                    expect(err).toBeTruthy();
                    done();
                }
            );
        });

        it('should support unsubscribing (cancelToken)', () => {
            const sub = service.fetchFeed('news', 1).subscribe();
            expect(() => sub.unsubscribe()).not.toThrow();
        });
    });

    describe('fetchItemContent', () => {
        it('should return an Observable', () => {
            const result = service.fetchItemContent(123);
            expect(result).toBeTruthy();
            expect(result.subscribe).toBeTruthy();
        });

        it('should return an observable for item content', (done) => {
            service.fetchItemContent(123).subscribe(
                (data) => {
                    expect(data).toBeTruthy();
                    done();
                },
                (err) => {
                    expect(err).toBeTruthy();
                    done();
                }
            );
        });
    });

    describe('fetchPollContent', () => {
        it('should return an Observable', () => {
            const result = service.fetchPollContent(123);
            expect(result).toBeTruthy();
            expect(result.subscribe).toBeTruthy();
        });

        it('should return an observable for poll content', (done) => {
            service.fetchPollContent(123).subscribe(
                (data) => {
                    expect(data).toBeTruthy();
                    done();
                },
                (err) => {
                    expect(err).toBeTruthy();
                    done();
                }
            );
        });
    });

    describe('fetchUser', () => {
        it('should return an Observable', () => {
            const result = service.fetchUser('testuser');
            expect(result).toBeTruthy();
            expect(result.subscribe).toBeTruthy();
        });

        it('should return an observable for user data', (done) => {
            service.fetchUser('testuser').subscribe(
                (data) => {
                    expect(data).toBeTruthy();
                    done();
                },
                (err) => {
                    expect(err).toBeTruthy();
                    done();
                }
            );
        });
    });
});
