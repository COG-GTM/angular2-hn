import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from '@angular/fire/database';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';
import { Comment } from '../models/comment';

@Injectable()
export class FirebaseAPIService {
    constructor(private db: AngularFireDatabase) {}

    fetchFeed(feedType: string, page: number): Observable<Story[]> {
        const storyType = this.mapFeedTypeToFirebase(feedType);
        return this.db.list(`/v0/${storyType}stories`).valueChanges().pipe(
            map((ids: number[]) => {
                const start = (page - 1) * 30;
                const end = start + 30;
                return ids.slice(start, end);
            }),
            switchMap((ids: number[]) => {
                if (ids.length === 0) {
                    return of([]);
                }
                const storyObservables = ids.map(id => this.fetchItemContent(id));
                return forkJoin(storyObservables);
            })
        );
    }

    fetchItemContent(id: number): Observable<Story> {
        return this.db.object(`/v0/item/${id}`).valueChanges().pipe(
            map((item: any) => {
                if (!item) {
                    return null;
                }
                const story = new Story();
                story.id = item.id;
                story.title = item.title || '';
                story.points = item.score || 0;
                story.user = item.by || '';
                story.time = item.time || 0;
                story.time_ago = this.getTimeAgo(item.time);
                story.type = item.type || 'story';
                story.url = item.url || '';
                story.domain = this.extractDomain(item.url);
                story.comments_count = item.descendants || 0;
                story.deleted = item.deleted || false;
                story.dead = item.dead || false;

                if (item.type === 'poll' && item.parts) {
                    story.poll = [];
                    story.poll_votes_count = 0;
                    item.parts.forEach((partId: number) => {
                        this.fetchPollContent(partId).subscribe(pollResult => {
                            story.poll.push(pollResult);
                            story.poll_votes_count += pollResult.points;
                        });
                    });
                }

                if (item.kids && item.kids.length > 0) {
                    story.comments = [];
                    this.fetchComments(item.kids, 0).subscribe(comments => {
                        story.comments = comments;
                    });
                }

                return story;
            })
        );
    }

    fetchPollContent(id: number): Observable<PollResult> {
        return this.db.object(`/v0/item/${id}`).valueChanges().pipe(
            map((item: any) => {
                const pollResult = new PollResult();
                pollResult.points = item.score || 0;
                pollResult.content = item.text || '';
                return pollResult;
            })
        );
    }

    fetchUser(id: string): Observable<User> {
        return this.db.object(`/v0/user/${id}`).valueChanges().pipe(
            map((userData: any) => {
                if (!userData) {
                    return null;
                }
                const user = new User();
                user.id = userData.id;
                user.crated_time = userData.created || 0;
                user.created = this.getTimeAgo(userData.created);
                user.karma = userData.karma || 0;
                user.avg = 0;
                user.about = userData.about || '';
                return user;
            })
        );
    }

    private fetchComments(kids: number[], level: number): Observable<Comment[]> {
        if (!kids || kids.length === 0) {
            return of([]);
        }

        const commentObservables = kids.map(id =>
            this.db.object(`/v0/item/${id}`).valueChanges().pipe(
                map((item: any) => {
                    if (!item || item.deleted || item.dead) {
                        return null;
                    }
                    const comment = new Comment();
                    comment.id = item.id;
                    comment.level = level;
                    comment.user = item.by || '';
                    comment.time = item.time || 0;
                    comment.time_ago = this.getTimeAgo(item.time);
                    comment.content = item.text || '';
                    comment.deleted = item.deleted || false;
                    comment.comments = [];

                    if (item.kids && item.kids.length > 0) {
                        this.fetchComments(item.kids, level + 1).subscribe(childComments => {
                            comment.comments = childComments;
                        });
                    }

                    return comment;
                }),
                map(comment => (comment ? [comment] : []))
            )
        );

        return forkJoin(commentObservables).pipe(
            map((commentArrays: Comment[][]) => {
                return commentArrays.reduce((acc, val) => acc.concat(val), []);
            })
        );
    }

    private mapFeedTypeToFirebase(feedType: string): string {
        const mapping = {
            news: 'top',
            newest: 'new',
            show: 'show',
            ask: 'ask',
            jobs: 'job'
        };
        return mapping[feedType] || 'top';
    }

    private getTimeAgo(timestamp: number): any {
        if (!timestamp) {
            return 0;
        }
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;

        const minutes = Math.floor(diff / 60);
        const hours = Math.floor(diff / 3600);
        const days = Math.floor(diff / 86400);

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            return 'just now';
        }
    }

    private extractDomain(url: string): string {
        if (!url) {
            return '';
        }
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (e) {
            return '';
        }
    }
}
