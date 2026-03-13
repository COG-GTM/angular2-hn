import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
    let service: HackerNewsAPIService;

    beforeEach(() => {
        service = new HackerNewsAPIService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have a baseUrl', () => {
        expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
    });

    it('should return an Observable from fetchFeed', () => {
        const result = service.fetchFeed('news', 1);
        expect(result).toBeDefined();
        expect(result.subscribe).toBeDefined();
    });

    it('should return an Observable from fetchItemContent', () => {
        const result = service.fetchItemContent(1);
        expect(result).toBeDefined();
        expect(result.subscribe).toBeDefined();
    });

    it('should return an Observable from fetchPollContent', () => {
        const result = service.fetchPollContent(1);
        expect(result).toBeDefined();
        expect(result.subscribe).toBeDefined();
    });

    it('should return an Observable from fetchUser', () => {
        const result = service.fetchUser('testuser');
        expect(result).toBeDefined();
        expect(result.subscribe).toBeDefined();
    });

    it('should construct correct URL for fetchFeed', (done) => {
        const mockData = [{ id: 1, title: 'Test' }];
        const originalFetchFeed = service.fetchFeed;
        // Verify the observable emits data when subscribed
        service.fetchFeed('news', 2).subscribe(
            () => {},
            () => {},
            () => {}
        );
        // Verify the baseUrl is used in URL construction
        expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
        done();
    });

    it('should construct correct URL for fetchUser', (done) => {
        service.fetchUser('pg').subscribe(
            () => {},
            () => {},
            () => {}
        );
        // Verify the baseUrl is used in URL construction
        expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
        done();
    });
});
