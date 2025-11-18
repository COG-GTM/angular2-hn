import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { HackerNewsAPIService } from './hackernews-api.service';
import { FirebaseAPIService } from './firebase-api.service';
import { SettingsService } from './settings.service';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

@Injectable()
export class APIService {
    constructor(
        private restAPIService: HackerNewsAPIService,
        private firebaseAPIService: FirebaseAPIService,
        private settingsService: SettingsService
    ) {}

    fetchFeed(feedType: string, page: number): Observable<Story[]> {
        if (this.settingsService.settings.useFirebaseSDK) {
            return this.firebaseAPIService.fetchFeed(feedType, page);
        }
        return this.restAPIService.fetchFeed(feedType, page);
    }

    fetchItemContent(id: number): Observable<Story> {
        if (this.settingsService.settings.useFirebaseSDK) {
            return this.firebaseAPIService.fetchItemContent(id);
        }
        return this.restAPIService.fetchItemContent(id);
    }

    fetchPollContent(id: number): Observable<PollResult> {
        if (this.settingsService.settings.useFirebaseSDK) {
            return this.firebaseAPIService.fetchPollContent(id);
        }
        return this.restAPIService.fetchPollContent(id);
    }

    fetchUser(id: string): Observable<User> {
        if (this.settingsService.settings.useFirebaseSDK) {
            return this.firebaseAPIService.fetchUser(id);
        }
        return this.restAPIService.fetchUser(id);
    }
}
