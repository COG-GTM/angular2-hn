import { Comment } from '../models/comment';
import { PollResult } from '../models/poll-result';
import { Story } from '../models/story';
import { User } from '../models/user';

const now = Math.floor(Date.now() / 1000);

function makeComment(
    id: number,
    user: string,
    timeAgo: string,
    content: string,
    level: number,
    minutesAgo: number,
    comments: Comment[] = []
): Comment {
    return {
        id,
        level,
        user,
        time: now - minutesAgo * 60,
        time_ago: timeAgo,
        content,
        deleted: false,
        comments
    };
}

function makeStory(
    id: number,
    title: string,
    points: number,
    user: string,
    timeAgo: string,
    type: 'poll' | 'story' | 'job',
    url: string,
    domain: string,
    comments: Comment[],
    commentsCount: number,
    content?: string,
    poll: PollResult[] = []
): Story {
    return {
        id,
        title,
        points,
        user,
        time: now - 60 * 60,
        time_ago: timeAgo,
        type,
        url,
        domain,
        content,
        comments,
        comments_count: commentsCount,
        poll,
        poll_votes_count: 0,
        deleted: false,
        dead: false
    };
}

const nestedComment = makeComment(
    30001002,
    'dang',
    '2 hours ago',
    'The key is making the first version small enough to ship and learn from.',
    1,
    120,
    [
        makeComment(
            30001008,
            'pg',
            '1 hour ago',
            'Exactly. The first release should make the next decision easier.',
            2,
            60
        )
    ]
);

const launchComments = [
    makeComment(
        30001001,
        'pg',
        '3 hours ago',
        'This is a thoughtful approach to keeping the feedback loop short.',
        0,
        180,
        [nestedComment]
    )
];

const databaseComments = [
    makeComment(
        30001003,
        'ada',
        '5 hours ago',
        'The operational details matter as much as the storage engine here.',
        0,
        300
    ),
    makeComment(
        30001004,
        'sam',
        '4 hours ago',
        'A clear explanation of the trade-offs. Thanks for writing it up.',
        0,
        240
    )
];

const browserComments = [
    makeComment(
        30001005,
        'maya',
        '6 hours ago',
        'The performance numbers are especially interesting on lower-end devices.',
        0,
        360
    )
];

const languageComments = [
    makeComment(
        30001006,
        'luis',
        '8 hours ago',
        'The type system makes this pattern surprisingly pleasant to maintain.',
        0,
        480
    )
];

const pollOptions: PollResult[] = [
    { points: 128, content: 'Ship a tiny version first' },
    { points: 94, content: 'Interview more users' },
    { points: 61, content: 'Wait for more data' }
];

const newsStories: Story[] = [
    makeStory(
        30000001,
        'A field guide to calm software launches',
        412,
        'pg',
        '3 hours ago',
        'story',
        'https://example.com/calm-launches',
        'example.com',
        launchComments,
        12
    ),
    makeStory(
        30000002,
        'How we made a reliable local-first database',
        287,
        'ada',
        '5 hours ago',
        'story',
        'https://example.com/local-first-database',
        'example.com',
        databaseComments,
        9
    ),
    makeStory(
        30000003,
        'The browser is becoming an operating system',
        198,
        'maya',
        '6 hours ago',
        'story',
        'https://example.com/browser-operating-system',
        'example.com',
        browserComments,
        7
    ),
    makeStory(
        30000004,
        'A practical introduction to capability-based security',
        176,
        'luis',
        '8 hours ago',
        'story',
        'https://example.com/capability-security',
        'example.com',
        languageComments,
        6
    ),
    makeStory(
        30000005,
        'Why small teams should own their deployment pipeline',
        153,
        'sam',
        '10 hours ago',
        'story',
        'https://example.com/deployment-pipeline',
        'example.com',
        [],
        0
    ),
    makeStory(
        30000006,
        'Notes from building a resilient command line tool',
        121,
        'dang',
        '12 hours ago',
        'story',
        'https://example.com/resilient-cli',
        'example.com',
        [],
        0
    ),
    makeStory(
        30000007,
        'Ask HN: What is your favorite tiny automation?',
        87,
        'pg',
        '14 hours ago',
        'story',
        'item?id=30000007',
        '',
        [],
        3,
        'I am collecting small automations that save a few minutes every day. What is one you use constantly?'
    ),
    makeStory(
        30000100,
        'Poll: How do you validate a new product idea?',
        142,
        'pg',
        '16 hours ago',
        'poll',
        'item?id=30000100',
        '',
        [],
        0,
        undefined,
        pollOptions
    )
];

const newestStories: Story[] = [
    makeStory(
        30000011,
        'A gentle guide to reading unfamiliar code',
        74,
        'ada',
        '24 minutes ago',
        'story',
        'https://example.com/reading-code',
        'example.com',
        [],
        0
    ),
    makeStory(
        30000012,
        'Show HN: A notebook for durable research notes',
        61,
        'maya',
        '41 minutes ago',
        'story',
        'item?id=30000012',
        '',
        [],
        2,
        'I built a lightweight notebook that keeps references close to the notes they support.'
    ),
    makeStory(
        30000013,
        'A visual explanation of queueing theory',
        43,
        'luis',
        '1 hour ago',
        'story',
        'https://example.com/queueing-theory',
        'example.com',
        [],
        0
    ),
    makeStory(
        30000014,
        'The surprising history of terminal colors',
        38,
        'sam',
        '2 hours ago',
        'story',
        'https://example.com/terminal-colors',
        'example.com',
        [],
        0
    ),
    makeStory(
        30000015,
        'A tiny HTTP server in 200 lines',
        29,
        'dang',
        '2 hours ago',
        'story',
        'https://example.com/tiny-http-server',
        'example.com',
        [],
        0
    )
];

const askStories: Story[] = [
    makeStory(
        30000021,
        'Ask HN: What habit improved your engineering work?',
        346,
        'pg',
        '1 day ago',
        'story',
        'item?id=30000021',
        '',
        [
            makeComment(
                30001021,
                'ada',
                '20 hours ago',
                'Writing down the problem before opening an editor has helped me enormously.',
                0,
                1200
            )
        ],
        18,
        'What small habit has made the biggest difference in your day-to-day engineering work?'
    ),
    makeStory(
        30000022,
        'Ask HN: Which technical book still holds up?',
        221,
        'sam',
        '1 day ago',
        'story',
        'item?id=30000022',
        '',
        [],
        11,
        'Which technical book do you still recommend after rereading it years later?'
    ),
    makeStory(
        30000023,
        'Ask HN: How do you keep side projects alive?',
        187,
        'maya',
        '2 days ago',
        'story',
        'item?id=30000023',
        '',
        [],
        8,
        'I would love to hear how people make consistent progress on projects outside work.'
    ),
    makeStory(
        30000024,
        'Ask HN: What is your favorite debugging technique?',
        164,
        'luis',
        '2 days ago',
        'story',
        'item?id=30000024',
        '',
        [],
        6,
        'What debugging technique do you reach for when the obvious approaches fail?'
    )
];

const showStories: Story[] = [
    makeStory(
        30000031,
        'Show HN: A quiet, offline reading list',
        132,
        'dang',
        '1 day ago',
        'story',
        'item?id=30000031',
        '',
        [],
        4,
        'A small reading list app that works without an account or an internet connection.'
    ),
    makeStory(
        30000032,
        'Show HN: A colorful terminal dashboard',
        97,
        'maya',
        '2 days ago',
        'story',
        'item?id=30000032',
        '',
        [],
        3,
        'I made a terminal dashboard for the metrics I check most often.'
    ),
    makeStory(
        30000033,
        'Show HN: A personal archive of family recipes',
        84,
        'ada',
        '3 days ago',
        'story',
        'item?id=30000033',
        '',
        [],
        5,
        'This is a simple archive for preserving recipes and the stories behind them.'
    ),
    makeStory(
        30000034,
        'Show HN: A toy compiler for learning language design',
        76,
        'luis',
        '3 days ago',
        'story',
        'item?id=30000034',
        '',
        [],
        2,
        'A deliberately small compiler project for experimenting with parsing and code generation.'
    )
];

const jobStories: Story[] = [
    makeStory(
        30000041,
        'Senior frontend engineer at a small product studio',
        0,
        '',
        '4 hours ago',
        'job',
        'https://example.com/jobs/frontend-engineer',
        'example.com',
        [],
        0
    ),
    makeStory(
        30000042,
        'Founding engineer for a developer tools startup',
        0,
        '',
        '1 day ago',
        'job',
        'https://example.com/jobs/founding-engineer',
        'example.com',
        [],
        0
    ),
    makeStory(
        30000043,
        'Product designer for an open source team',
        0,
        '',
        '2 days ago',
        'job',
        'https://example.com/jobs/product-designer',
        'example.com',
        [],
        0
    )
];

export const MOCK_FEEDS: { [feedType: string]: Story[] } = {
    news: newsStories,
    newest: newestStories,
    ask: askStories,
    show: showStories,
    jobs: jobStories
};

export const MOCK_STORIES: Story[] = ([] as Story[]).concat(
    newsStories,
    newestStories,
    askStories,
    showStories,
    jobStories
);

export const MOCK_POLL_OPTIONS: { [id: number]: PollResult } = {
    30000101: pollOptions[0],
    30000102: pollOptions[1],
    30000103: pollOptions[2]
};

export const MOCK_USERS: { [id: string]: User } = {
    pg: {
        id: 'pg',
        crated_time: now - 12 * 365 * 24 * 60 * 60,
        created: '12 years ago',
        karma: 184321,
        avg: 4.8,
        about: '<p>Co-founder of Y Combinator and longtime participant in the startup community.</p>'
    },
    ada: {
        id: 'ada',
        crated_time: now - 9 * 365 * 24 * 60 * 60,
        created: '9 years ago',
        karma: 23841,
        avg: 4.4,
        about: '<p>Engineer interested in dependable systems, programming languages, and clear writing.</p>'
    },
    maya: {
        id: 'maya',
        crated_time: now - 7 * 365 * 24 * 60 * 60,
        created: '7 years ago',
        karma: 15420,
        avg: 4.2,
        about: '<p>Frontend engineer exploring accessible interfaces and resilient web applications.</p>'
    },
    luis: {
        id: 'luis',
        crated_time: now - 6 * 365 * 24 * 60 * 60,
        created: '6 years ago',
        karma: 11208,
        avg: 4.1,
        about: '<p>I like compilers, developer tools, and making complex ideas approachable.</p>'
    },
    sam: {
        id: 'sam',
        crated_time: now - 5 * 365 * 24 * 60 * 60,
        created: '5 years ago',
        karma: 9876,
        avg: 3.9,
        about: '<p>Builder of small tools and occasional writer about software teams.</p>'
    },
    dang: {
        id: 'dang',
        crated_time: now - 11 * 365 * 24 * 60 * 60,
        created: '11 years ago',
        karma: 47652,
        avg: 4.6,
        about: '<p>Moderator and curious reader. Please be kind and keep discussions constructive.</p>'
    }
};

export const MOCK_ITEMS: { [id: number]: Story } = MOCK_STORIES.reduce(
    (items: { [id: number]: Story }, story: Story) => {
        items[story.id] = story;
        return items;
    },
    {}
);
