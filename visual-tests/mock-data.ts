export const mockFeedData = [
    {
        id: 40000001,
        title: "Show HN: A New Way to Build Web Apps",
        points: 342,
        user: "pg",
        time: 1700000000,
        time_ago: "3 hours ago",
        type: "story",
        url: "https://example.com/show-hn-web-apps",
        domain: "example.com",
        comments: [],
        comments_count: 128,
        content: "",
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false
    },
    {
        id: 40000002,
        title: "Why Rust Is the Future of Systems Programming",
        points: 256,
        user: "dang",
        time: 1700000100,
        time_ago: "2 hours ago",
        type: "story",
        url: "https://blog.example.com/rust-future",
        domain: "blog.example.com",
        comments: [],
        comments_count: 89,
        content: "",
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false
    },
    {
        id: 40000003,
        title: "Ask HN: What are you working on?",
        points: 198,
        user: "sama",
        time: 1700000200,
        time_ago: "1 hour ago",
        type: "story",
        url: "",
        domain: "",
        comments: [],
        comments_count: 245,
        content: "",
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false
    },
    {
        id: 40000004,
        title: "The Art of PostgreSQL: A Modern Guide",
        points: 178,
        user: "tptacek",
        time: 1700000300,
        time_ago: "45 minutes ago",
        type: "story",
        url: "https://postgresql.example.com/art",
        domain: "postgresql.example.com",
        comments: [],
        comments_count: 67,
        content: "",
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false
    },
    {
        id: 40000005,
        title: "Launch HN: DevTools AI (YC W24) - AI-Powered Developer Tools",
        points: 156,
        user: "jl",
        time: 1700000400,
        time_ago: "30 minutes ago",
        type: "story",
        url: "https://devtools.ai",
        domain: "devtools.ai",
        comments: [],
        comments_count: 34,
        content: "",
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false
    }
];

export const mockItemData = {
    id: 40000001,
    title: "Show HN: A New Way to Build Web Apps",
    points: 342,
    user: "pg",
    time: 1700000000,
    time_ago: "3 hours ago",
    type: "story",
    url: "https://example.com/show-hn-web-apps",
    domain: "example.com",
    content: "",
    comments_count: 2,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    comments: [
        {
            id: 40000101,
            level: 0,
            user: "dang",
            time: 1700001000,
            time_ago: "2 hours ago",
            content: "<p>This is a really interesting approach. I've been looking for something like this for a while.</p>",
            deleted: false,
            comments: [
                {
                    id: 40000102,
                    level: 1,
                    user: "tptacek",
                    time: 1700002000,
                    time_ago: "1 hour ago",
                    content: "<p>Agreed. The architecture looks solid and the performance benchmarks are impressive.</p>",
                    deleted: false,
                    comments: []
                }
            ]
        },
        {
            id: 40000103,
            level: 0,
            user: "sama",
            time: 1700003000,
            time_ago: "30 minutes ago",
            content: "<p>Great work! Would love to see how this compares with existing solutions in production.</p>",
            deleted: false,
            comments: []
        }
    ]
};

export const mockUserData = {
    id: "pg",
    crated_time: 1160418111,
    created: "15 years ago",
    karma: 155111,
    avg: null,
    about: "Bug fixer."
};

export const mockJobsData = [
    {
        id: 40000010,
        title: "Stripe (YC S09) Is Hiring Engineers",
        points: 0,
        user: "",
        time: 1700000000,
        time_ago: "1 day ago",
        type: "job",
        url: "https://stripe.com/jobs",
        domain: "stripe.com",
        comments: [],
        comments_count: 0,
        content: "",
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false
    },
    {
        id: 40000011,
        title: "Airbnb (YC W09) - Senior Frontend Engineer",
        points: 0,
        user: "",
        time: 1700000100,
        time_ago: "2 days ago",
        type: "job",
        url: "https://airbnb.com/careers",
        domain: "airbnb.com",
        comments: [],
        comments_count: 0,
        content: "",
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false
    }
];
