import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import 'firebase/database';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';
import { environment } from '../../../environments/environment';

@Injectable()
export class FirebaseService {
    private db: firebase.database.Database;
    private initialized = false;

    constructor() {
        this.initializeFirebase();
    }

    private initializeFirebase() {
        if (!this.initialized && !firebase.apps.length) {
            firebase.initializeApp(environment.firebase);
            this.db = firebase.database();
            this.initialized = true;
        } else if (firebase.apps.length) {
            this.db = firebase.database();
            this.initialized = true;
        }
    }

    fetchFeed(feedType: string, page: number): Observable<Story[]> {
        return new Observable<Story[]>(observer => {
            const feedRef = this.db.ref(`v0/${feedType}stories`);

            feedRef.once('value', snapshot => {
                const storyIds = snapshot.val();
                if (!storyIds || storyIds.length === 0) {
                    observer.next([]);
                    observer.complete();
                    return;
                }

                const startIndex = (page - 1) * 30;
                const endIndex = startIndex + 30;
                const pageIds = storyIds.slice(startIndex, endIndex);

                const storyPromises = pageIds.map(id =>
                    this.db.ref(`v0/item/${id}`).once('value').then(snap => snap.val())
                );

                Promise.all(storyPromises)
                    .then(stories => {
                        const formattedStories = stories
                            .filter(story => story !== null)
                            .map(story => this.formatStory(story));
                        observer.next(formattedStories);
                        observer.complete();
                    })
                    .catch(error => observer.error(error));
            }, error => observer.error(error));
        });
    }

    fetchItemContent(id: number): Observable<Story> {
        return new Observable<Story>(observer => {
            const itemRef = this.db.ref(`v0/item/${id}`);

            itemRef.once('value', snapshot => {
                const item = snapshot.val();
                if (!item) {
                    observer.error(new Error('Item not found'));
                    return;
                }

                const formattedStory = this.formatStory(item);

                if (formattedStory.type === 'poll' && formattedStory.poll) {
                    const numberOfPollOptions = formattedStory.poll.length;
                    formattedStory.poll_votes_count = 0;

                    const pollPromises = [];
                    for (let i = 1; i <= numberOfPollOptions; i++) {
                        pollPromises.push(
                            this.db.ref(`v0/item/${formattedStory.id + i}`)
                                .once('value')
                                .then(pollSnap => pollSnap.val())
                        );
                    }

                    Promise.all(pollPromises)
                        .then(pollResults => {
                            pollResults.forEach((pollResult, index) => {
                                if (pollResult) {
                                    formattedStory.poll[index] = this.formatPollResult(pollResult);
                                    formattedStory.poll_votes_count += pollResult.score || 0;
                                }
                            });
                            observer.next(formattedStory);
                            observer.complete();
                        })
                        .catch(error => observer.error(error));
                } else {
                    observer.next(formattedStory);
                    observer.complete();
                }
            }, error => observer.error(error));
        });
    }

    fetchPollContent(id: number): Observable<PollResult> {
        return new Observable<PollResult>(observer => {
            const itemRef = this.db.ref(`v0/item/${id}`);

            itemRef.once('value', snapshot => {
                const item = snapshot.val();
                if (!item) {
                    observer.error(new Error('Poll item not found'));
                    return;
                }
                observer.next(this.formatPollResult(item));
                observer.complete();
            }, error => observer.error(error));
        });
    }

    fetchUser(id: string): Observable<User> {
        return new Observable<User>(observer => {
            const userRef = this.db.ref(`v0/user/${id}`);

            userRef.once('value', snapshot => {
                const user = snapshot.val();
                if (!user) {
                    observer.error(new Error('User not found'));
                    return;
                }
                observer.next(this.formatUser(user));
                observer.complete();
            }, error => observer.error(error));
        });
    }

    private formatStory(firebaseStory: any): Story {
        const story = new Story();
        story.id = firebaseStory.id;
        story.title = firebaseStory.title;
        story.points = firebaseStory.score;
        story.user = firebaseStory.by;
        story.time = firebaseStory.time;
        story.time_ago = firebaseStory.time;
        story.comments_count = firebaseStory.descendants || 0;
        story.type = firebaseStory.type;
        story.url = firebaseStory.url;
        story.domain = firebaseStory.url ? this.extractDomain(firebaseStory.url) : '';
        story.comments = firebaseStory.kids ? this.formatComments(firebaseStory.kids) : [];
        story.poll = firebaseStory.parts || [];
        story.poll_votes_count = 0;
        story.deleted = firebaseStory.deleted || false;
        story.dead = firebaseStory.dead || false;
        return story;
    }

    private formatPollResult(firebasePoll: any): PollResult {
        const pollResult = new PollResult();
        pollResult.points = firebasePoll.score;
        pollResult.content = firebasePoll.text;
        return pollResult;
    }

    private formatUser(firebaseUser: any): User {
        const user = new User();
        user.id = firebaseUser.id;
        user.created = new Date(firebaseUser.created * 1000).toISOString();
        user.crated_time = firebaseUser.created;
        user.karma = firebaseUser.karma;
        user.about = firebaseUser.about || '';
        user.avg = 0;
        return user;
    }

    private formatComments(kids: number[]): any[] {
        return kids || [];
    }

    private extractDomain(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (e) {
            return '';
        }
    }

}
