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

    it('should call fetchFeed and return an Observable', () => {
        const mockData = [{ id: 1, title: 'Test Story' }];
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                json: () => Promise.resolve(mockData),
            } as any)
        );
        service.fetchFeed('news', 1).subscribe((data) => {
            expect(data).toEqual(mockData as any);
        });
    });

    it('should call fetchItemContent and return an Observable', () => {
        const mockStory = { id: 1, title: 'Test', type: 'story', comments: [] };
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                json: () => Promise.resolve(mockStory),
            } as any)
        );
        service.fetchItemContent(1).subscribe((data) => {
            expect(data).toBeDefined();
            expect(data.id).toBe(1);
        });
    });

    it('should handle poll type in fetchItemContent', () => {
        const mockPoll = {
            id: 100,
            title: 'Poll Test',
            type: 'poll',
            poll: [{}, {}],
            poll_votes_count: 0,
            comments: [],
        };
        const mockPollResult = { points: 10, content: 'Option 1' };
        let callCount = 0;
        spyOn(window, 'fetch').and.callFake((url: string) => {
            if (url.includes('/item/100')) {
                return Promise.resolve({
                    json: () => Promise.resolve(mockPoll),
                } as any);
            }
            callCount++;
            return Promise.resolve({
                json: () => Promise.resolve(mockPollResult),
            } as any);
        });

        service.fetchItemContent(100).subscribe((data) => {
            expect(data.type).toBe('poll');
        });
    });

    it('should call fetchPollContent and return an Observable', () => {
        const mockPollResult = { points: 5, content: 'Option A' };
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                json: () => Promise.resolve(mockPollResult),
            } as any)
        );
        service.fetchPollContent(101).subscribe((data) => {
            expect(data.points).toBe(5);
            expect(data.content).toBe('Option A');
        });
    });

    it('should call fetchUser and return an Observable', () => {
        const mockUser = { id: 'testuser', karma: 100, created: '2 years ago' };
        spyOn(window, 'fetch').and.returnValue(
            Promise.resolve({
                json: () => Promise.resolve(mockUser),
            } as any)
        );
        service.fetchUser('testuser').subscribe((data) => {
            expect(data.id).toBe('testuser');
            expect(data.karma).toBe(100);
        });
    });

    it('should handle fetch error in fetchFeed', () => {
        spyOn(window, 'fetch').and.returnValue(Promise.reject('Network error'));
        service.fetchFeed('news', 1).subscribe(
            () => fail('should have errored'),
            (error) => {
                expect(error).toBe('Network error');
            }
        );
    });

    it('should return an observable from fetchFeed for different feed types', () => {
        const result = service.fetchFeed('show', 3);
        expect(result).toBeDefined();
        expect(typeof result.subscribe).toBe('function');
    });

    it('should return an observable from fetchUser for any user id', () => {
        const result = service.fetchUser('pg');
        expect(result).toBeDefined();
        expect(typeof result.subscribe).toBe('function');
    });
});
