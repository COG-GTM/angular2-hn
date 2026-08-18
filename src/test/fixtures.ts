import type { Comment, Story, User } from '../models';

export const mockComment: Comment = {
    id: 200,
    level: 0,
    user: 'commenter',
    time: 1583020800,
    time_ago: '2 hours ago',
    content: '<p>A top level comment</p>',
    comments: [
        {
            id: 201,
            level: 1,
            user: 'replier',
            time: 1583024400,
            time_ago: '1 hour ago',
            content: '<p>A nested reply</p>',
            comments: [],
        },
    ],
};

export const mockDeletedComment: Comment = {
    id: 202,
    level: 0,
    user: '',
    time: 1583020800,
    time_ago: '3 hours ago',
    content: '',
    deleted: true,
    comments: [],
};

export const mockStory: Story = {
    id: 100,
    title: 'A great story',
    points: 42,
    user: 'author',
    time: 1583020800,
    time_ago: '4 hours ago',
    type: 'story',
    url: 'https://example.com/great-story',
    domain: 'example.com',
    comments: [],
    comments_count: 5,
};

export const mockInternalStory: Story = {
    ...mockStory,
    id: 101,
    title: 'Ask HN: something?',
    url: 'item?id=101',
    domain: '',
    comments_count: 1,
};

export const mockJobStory: Story = {
    ...mockStory,
    id: 102,
    title: 'Startup is hiring',
    type: 'job',
    comments_count: 0,
};

export const mockStoryWithComments: Story = {
    ...mockStory,
    comments: [mockComment, mockDeletedComment],
};

export const mockPollStory: Story = {
    id: 300,
    title: 'Poll: which one?',
    points: 10,
    user: 'pollster',
    time: 1583020800,
    time_ago: '5 hours ago',
    type: 'poll',
    url: 'item?id=300',
    domain: '',
    content: '<p>Pick one</p>',
    comments: [],
    comments_count: 2,
    poll: [
        { points: 0, content: 'Option A' },
        { points: 0, content: 'Option B' },
    ],
};

export const mockUser: User = {
    id: 'author',
    created: '5 years ago',
    created_time: 1400000000,
    karma: 1234,
    about: '<p>Hello there</p>',
};

export const mockFeed: Story[] = [mockStory, mockInternalStory, mockJobStory];
