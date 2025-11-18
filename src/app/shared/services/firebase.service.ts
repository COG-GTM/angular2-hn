import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

@Injectable()
export class FirebaseService {
    constructor(private db: AngularFireDatabase) {}

    fetchFeed(feedType: string, page: number): Observable<Story[]> {
        const feedMap = {
            news: 'topstories',
            newest: 'newstories',
            show: 'showstories',
            ask: 'askstories',
            jobs: 'jobstories'
        };

        const firebaseFeedType = feedMap[feedType] || 'topstories';
        const itemsPerPage = 30;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return this.db.list(`/v0/${firebaseFeedType}`).valueChanges().pipe(
            map((ids: any[]) => ids.slice(startIndex, endIndex)),
            switchMap((ids: number[]) => {
                if (!ids || ids.length === 0) {
                    return of([]);
                }
                const itemObservables = ids.map(id => this.fetchItemContent(id));
                return forkJoin(itemObservables);
            })
        );
    }

    fetchItemContent(id: number): Observable<Story> {
        return this.db.object(`/v0/item/${id}`).valueChanges().pipe(
            map((item: any) => {
                if (!item) {
                    return null;
                }

                const story: Story = {
                    id: item.id,
                    title: item.title || '',
                    points: item.score || 0,
                    user: item.by || '',
                    time: item.time || 0,
                    time_ago: this.timeAgo(item.time),
                    comments_count: item.descendants || 0,
                    type: item.type || 'story',
                    url: item.url || '',
                    domain: item.url ? this.extractDomain(item.url) : '',
                    comments: [],
                    content: item.text || '',
                    deleted: item.deleted || false,
                    dead: item.dead || false,
                    poll: item.parts || [],
                    poll_votes_count: 0
                };

                if (item.kids && item.kids.length > 0) {
                    this.fetchComments(item.kids).subscribe(comments => {
                        story.comments = comments;
                    });
                }

                if (story.type === 'poll' && story.poll.length > 0) {
                    story.poll.forEach((pollId, index) => {
                        this.fetchPollContent(pollId).subscribe(pollResult => {
                            story.poll[index] = pollResult;
                            story.poll_votes_count += pollResult.points;
                        });
                    });
                }

                return story;
            })
        );
    }

    fetchPollContent(id: number): Observable<PollResult> {
        return this.db.object(`/v0/item/${id}`).valueChanges().pipe(
            map((item: any) => {
                if (!item) {
                    return null;
                }
                return {
                    id: item.id,
                    text: item.text || '',
                    points: item.score || 0
                };
            })
        );
    }

    fetchUser(id: string): Observable<User> {
        return this.db.object(`/v0/user/${id}`).valueChanges().pipe(
            map((user: any) => {
                if (!user) {
                    return null;
                }
                return {
                    id: user.id,
                    created: user.created,
                    karma: user.karma,
                    about: user.about || '',
                    created_time: this.timeAgo(user.created)
                };
            })
        );
    }

    private fetchComments(commentIds: number[]): Observable<any[]> {
        if (!commentIds || commentIds.length === 0) {
            return of([]);
        }
        const commentObservables = commentIds.map(id => this.fetchComment(id));
        return forkJoin(commentObservables);
    }

    private fetchComment(id: number): Observable<any> {
        return this.db.object(`/v0/item/${id}`).valueChanges().pipe(
            map((comment: any) => {
                if (!comment) {
                    return null;
                }

                const commentObj = {
                    id: comment.id,
                    user: comment.by || '',
                    time_ago: this.timeAgo(comment.time),
                    content: comment.text || '',
                    comments: [],
                    deleted: comment.deleted || false,
                    dead: comment.dead || false,
                    level: 0
                };

                if (comment.kids && comment.kids.length > 0) {
                    this.fetchComments(comment.kids).subscribe(replies => {
                        commentObj.comments = replies;
                    });
                }

                return commentObj;
            })
        );
    }

    private timeAgo(timestamp: number): string {
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
        } else if (diff < 2592000) {
            const days = Math.floor(diff / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (diff < 31536000) {
            const months = Math.floor(diff / 2592000);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        } else {
            const years = Math.floor(diff / 31536000);
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
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
