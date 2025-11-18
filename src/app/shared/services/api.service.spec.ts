import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { APIService } from './api.service';
import { HackerNewsAPIService } from './hackernews-api.service';
import { FirebaseAPIService } from './firebase-api.service';
import { SettingsService } from './settings.service';
import { Story } from '../models/story';
import { User } from '../models/user';

describe('APIService', () => {
    let service: APIService;
    let mockRestAPIService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockFirebaseAPIService: jasmine.SpyObj<FirebaseAPIService>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;

    beforeEach(() => {
        const restSpy = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed', 'fetchItemContent', 'fetchPollContent', 'fetchUser']);
        const firebaseSpy = jasmine.createSpyObj('FirebaseAPIService', ['fetchFeed', 'fetchItemContent', 'fetchPollContent', 'fetchUser']);
        const settingsSpy = jasmine.createSpyObj('SettingsService', [], {
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
                useFirebaseSDK: false
            }
        });

        TestBed.configureTestingModule({
            providers: [
                APIService,
                { provide: HackerNewsAPIService, useValue: restSpy },
                { provide: FirebaseAPIService, useValue: firebaseSpy },
                { provide: SettingsService, useValue: settingsSpy }
            ]
        });

        service = TestBed.inject(APIService);
        mockRestAPIService = TestBed.inject(HackerNewsAPIService) as jasmine.SpyObj<HackerNewsAPIService>;
        mockFirebaseAPIService = TestBed.inject(FirebaseAPIService) as jasmine.SpyObj<FirebaseAPIService>;
        mockSettingsService = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('fetchFeed', () => {
        it('should use REST API when Firebase SDK is disabled', (done) => {
            const mockStories: Story[] = [{ id: 1, title: 'Test' } as Story];
            mockRestAPIService.fetchFeed.and.returnValue(of(mockStories));
            mockSettingsService.settings.useFirebaseSDK = false;

            service.fetchFeed('news', 1).subscribe(stories => {
                expect(mockRestAPIService.fetchFeed).toHaveBeenCalledWith('news', 1);
                expect(mockFirebaseAPIService.fetchFeed).not.toHaveBeenCalled();
                expect(stories).toEqual(mockStories);
                done();
            });
        });

        it('should use Firebase API when Firebase SDK is enabled', (done) => {
            const mockStories: Story[] = [{ id: 1, title: 'Test' } as Story];
            mockFirebaseAPIService.fetchFeed.and.returnValue(of(mockStories));
            mockSettingsService.settings.useFirebaseSDK = true;

            service.fetchFeed('news', 1).subscribe(stories => {
                expect(mockFirebaseAPIService.fetchFeed).toHaveBeenCalledWith('news', 1);
                expect(mockRestAPIService.fetchFeed).not.toHaveBeenCalled();
                expect(stories).toEqual(mockStories);
                done();
            });
        });
    });

    describe('fetchItemContent', () => {
        it('should use REST API when Firebase SDK is disabled', (done) => {
            const mockStory: Story = { id: 123, title: 'Test Story' } as Story;
            mockRestAPIService.fetchItemContent.and.returnValue(of(mockStory));
            mockSettingsService.settings.useFirebaseSDK = false;

            service.fetchItemContent(123).subscribe(story => {
                expect(mockRestAPIService.fetchItemContent).toHaveBeenCalledWith(123);
                expect(mockFirebaseAPIService.fetchItemContent).not.toHaveBeenCalled();
                expect(story).toEqual(mockStory);
                done();
            });
        });

        it('should use Firebase API when Firebase SDK is enabled', (done) => {
            const mockStory: Story = { id: 123, title: 'Test Story' } as Story;
            mockFirebaseAPIService.fetchItemContent.and.returnValue(of(mockStory));
            mockSettingsService.settings.useFirebaseSDK = true;

            service.fetchItemContent(123).subscribe(story => {
                expect(mockFirebaseAPIService.fetchItemContent).toHaveBeenCalledWith(123);
                expect(mockRestAPIService.fetchItemContent).not.toHaveBeenCalled();
                expect(story).toEqual(mockStory);
                done();
            });
        });
    });

    describe('fetchUser', () => {
        it('should use REST API when Firebase SDK is disabled', (done) => {
            const mockUser: User = { id: 'testuser', karma: 100 } as User;
            mockRestAPIService.fetchUser.and.returnValue(of(mockUser));
            mockSettingsService.settings.useFirebaseSDK = false;

            service.fetchUser('testuser').subscribe(user => {
                expect(mockRestAPIService.fetchUser).toHaveBeenCalledWith('testuser');
                expect(mockFirebaseAPIService.fetchUser).not.toHaveBeenCalled();
                expect(user).toEqual(mockUser);
                done();
            });
        });

        it('should use Firebase API when Firebase SDK is enabled', (done) => {
            const mockUser: User = { id: 'testuser', karma: 100 } as User;
            mockFirebaseAPIService.fetchUser.and.returnValue(of(mockUser));
            mockSettingsService.settings.useFirebaseSDK = true;

            service.fetchUser('testuser').subscribe(user => {
                expect(mockFirebaseAPIService.fetchUser).toHaveBeenCalledWith('testuser');
                expect(mockRestAPIService.fetchUser).not.toHaveBeenCalled();
                expect(user).toEqual(mockUser);
                done();
            });
        });
    });
});
