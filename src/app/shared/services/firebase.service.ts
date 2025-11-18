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
        return {
            id: firebaseStory.id,
            title: firebaseStory.title,
            points: firebaseStory.score,
            user: firebaseStory.by,
            time: firebaseStory.time,
            time_ago: this.getTimeAgo(firebaseStory.time),
            comments_count: firebaseStory.descendants || 0,
            type: firebaseStory.type,
            url: firebaseStory.url,
            domain: firebaseStory.url ? this.extractDomain(firebaseStory.url) : '',
            comments: firebaseStory.kids ? this.formatComments(firebaseStory.kids) : [],
            content: firebaseStory.text || '',
            poll: firebaseStory.parts || [],
            poll_votes_count: 0
        };
    }

    private formatPollResult(firebasePoll: any): PollResult {
        return {
            id: firebasePoll.id,
            points: firebasePoll.score,
            text: firebasePoll.text,
            time_ago: this.getTimeAgo(firebasePoll.time)
        };
    }

    private formatUser(firebaseUser: any): User {
        return {
            id: firebaseUser.id,
            created: firebaseUser.created,
            karma: firebaseUser.karma,
            about: firebaseUser.about || '',
            submitted: firebaseUser.submitted || []
        };
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

    private getTimeAgo(timestamp: number): string {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;

        if (diff < 60) {
            return 'just now';
        } else if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diff / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }
}
