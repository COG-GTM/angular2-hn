import { TestBed } from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/database';
import { of } from 'rxjs';

import { FirebaseAPIService } from './firebase-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

describe('FirebaseAPIService', () => {
    let service: FirebaseAPIService;
    let mockAngularFireDatabase: jasmine.SpyObj<AngularFireDatabase>;

    beforeEach(() => {
        const dbSpy = jasmine.createSpyObj('AngularFireDatabase', ['list', 'object']);

        TestBed.configureTestingModule({
            providers: [
                FirebaseAPIService,
                { provide: AngularFireDatabase, useValue: dbSpy }
            ]
        });

        service = TestBed.inject(FirebaseAPIService);
        mockAngularFireDatabase = TestBed.inject(AngularFireDatabase) as jasmine.SpyObj<AngularFireDatabase>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('fetchFeed', () => {
        it('should fetch top stories for news feed', (done) => {
            const mockIds = [1, 2, 3];
            const mockStory = {
                id: 1,
                title: 'Test Story',
                score: 100,
                by: 'testuser',
                time: 1234567890,
                type: 'story',
                url: 'https://example.com',
                descendants: 10
            };

            const listSpy = jasmine.createSpyObj('list', ['valueChanges']);
            listSpy.valueChanges.and.returnValue(of(mockIds));
            mockAngularFireDatabase.list.and.returnValue(listSpy);

            const objectSpy = jasmine.createSpyObj('object', ['valueChanges']);
            objectSpy.valueChanges.and.returnValue(of(mockStory));
            mockAngularFireDatabase.object.and.returnValue(objectSpy);

            service.fetchFeed('news', 1).subscribe(stories => {
                expect(stories).toBeDefined();
                expect(stories.length).toBe(3);
                done();
            });
        });

        it('should return empty array when no story ids', (done) => {
            const listSpy = jasmine.createSpyObj('list', ['valueChanges']);
            listSpy.valueChanges.and.returnValue(of([]));
            mockAngularFireDatabase.list.and.returnValue(listSpy);

            service.fetchFeed('news', 1).subscribe(stories => {
                expect(stories).toEqual([]);
                done();
            });
        });

        it('should map feed types correctly', (done) => {
            const mockIds = [1];
            const listSpy = jasmine.createSpyObj('list', ['valueChanges']);
            listSpy.valueChanges.and.returnValue(of(mockIds));
            mockAngularFireDatabase.list.and.returnValue(listSpy);

            const objectSpy = jasmine.createSpyObj('object', ['valueChanges']);
            objectSpy.valueChanges.and.returnValue(of({ id: 1, type: 'story' }));
            mockAngularFireDatabase.object.and.returnValue(objectSpy);

            service.fetchFeed('newest', 1).subscribe(() => {
                expect(mockAngularFireDatabase.list).toHaveBeenCalledWith('/v0/newstories');
                done();
            });
        });
    });

    describe('fetchItemContent', () => {
        it('should fetch and transform item data', (done) => {
            const mockItem = {
                id: 123,
                title: 'Test Item',
                score: 50,
                by: 'testuser',
                time: 1234567890,
                type: 'story',
                url: 'https://example.com',
                descendants: 5
            };

            const objectSpy = jasmine.createSpyObj('object', ['valueChanges']);
            objectSpy.valueChanges.and.returnValue(of(mockItem));
            mockAngularFireDatabase.object.and.returnValue(objectSpy);

            service.fetchItemContent(123).subscribe(story => {
                expect(story).toBeDefined();
                expect(story.id).toBe(123);
                expect(story.title).toBe('Test Item');
                expect(story.points).toBe(50);
                expect(story.user).toBe('testuser');
                done();
            });
        });

        it('should return null for missing item', (done) => {
            const objectSpy = jasmine.createSpyObj('object', ['valueChanges']);
            objectSpy.valueChanges.and.returnValue(of(null));
            mockAngularFireDatabase.object.and.returnValue(objectSpy);

            service.fetchItemContent(999).subscribe(story => {
                expect(story).toBeNull();
                done();
            });
        });
    });

    describe('fetchPollContent', () => {
        it('should fetch and transform poll data', (done) => {
            const mockPoll = {
                id: 456,
                score: 25,
                text: 'Poll option text'
            };

            const objectSpy = jasmine.createSpyObj('object', ['valueChanges']);
            objectSpy.valueChanges.and.returnValue(of(mockPoll));
            mockAngularFireDatabase.object.and.returnValue(objectSpy);

            service.fetchPollContent(456).subscribe(pollResult => {
                expect(pollResult).toBeDefined();
                expect(pollResult.points).toBe(25);
                expect(pollResult.content).toBe('Poll option text');
                done();
            });
        });
    });

    describe('fetchUser', () => {
        it('should fetch and transform user data', (done) => {
            const mockUser = {
                id: 'testuser',
                created: 1234567890,
                karma: 1000,
                about: 'Test user bio'
            };

            const objectSpy = jasmine.createSpyObj('object', ['valueChanges']);
            objectSpy.valueChanges.and.returnValue(of(mockUser));
            mockAngularFireDatabase.object.and.returnValue(objectSpy);

            service.fetchUser('testuser').subscribe(user => {
                expect(user).toBeDefined();
                expect(user.id).toBe('testuser');
                expect(user.karma).toBe(1000);
                expect(user.about).toBe('Test user bio');
                done();
            });
        });

        it('should return null for missing user', (done) => {
            const objectSpy = jasmine.createSpyObj('object', ['valueChanges']);
            objectSpy.valueChanges.and.returnValue(of(null));
            mockAngularFireDatabase.object.and.returnValue(objectSpy);

            service.fetchUser('nonexistent').subscribe(user => {
                expect(user).toBeNull();
                done();
            });
        });
    });
});
