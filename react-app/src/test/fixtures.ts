import type { Story } from '../shared/models/story';
import type { User } from '../shared/models/user';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 8863,
        title: 'My YC app: Dropbox - Throw away your USB drive',
        points: 111,
        user: 'dhouston',
        time: 1175714200,
        time_ago: '9 years ago',
        type: 'story',
        url: 'http://www.getdropbox.com/u/2/screencast.html',
        domain: 'getdropbox.com',
        comments: [],
        comments_count: 71,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

export function makeStories(count: number, overrides: Partial<Story> = {}): Story[] {
    return Array.from({ length: count }, (_unused, index) =>
        makeStory({ id: 1000 + index, title: `Story ${index + 1}`, ...overrides })
    );
}

export function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 'pg',
        crated_time: 1160418092,
        created: 'October 9, 2006',
        karma: 155111,
        avg: 0,
        about: 'Bug fixer.',
        ...overrides,
    };
}
