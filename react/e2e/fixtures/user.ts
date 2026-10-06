/** Shapes match the live node-hnapi `/user/<id>` and feed responses (the user endpoint is mocked; it 404s live). */
export const USERS = {
    pg: {
        id: 'pg',
        created_time: 1160418092,
        created: '20 years ago',
        karma: 157316,
        avg: null,
        about: 'Bug fixer. <a href="https://paulgraham.com">paulgraham.com</a><script>window.__xss = true</script>',
    },
    dang: {
        id: 'dang',
        created_time: 1191529364,
        created: '19 years ago',
        karma: 30000,
        avg: null,
    },
} as const;

export const NEWS_FEED = [
    {
        id: 8863,
        title: 'My YC app: Dropbox - Throw away your USB drive',
        points: 104,
        user: 'dhouston',
        time: 1175714200,
        time_ago: '19 years ago',
        comments_count: 71,
        type: 'link',
        url: 'http://www.getdropbox.com/u/2/screencast.html',
        domain: 'getdropbox.com',
    },
];
