const HN_API_BASE = 'https://api.hnpwa.com/v0';

export interface HNItem {
    id: number;
    title: string;
    points?: number;
    user?: string;
    time: number;
    time_ago: string;
    comments_count: number;
    type: string;
    url?: string;
    domain?: string;
    comments?: HNComment[];
    content?: string;
}

export interface HNComment {
    id: number;
    level: number;
    user?: string;
    time: number;
    time_ago: string;
    content: string;
    comments: HNComment[];
}

export interface HNUser {
    id: string;
    created: number;
    karma: number;
    about?: string;
}

export type FeedType = 'news' | 'newest' | 'ask' | 'show' | 'jobs';

export const fetchFeed = async (feedType: FeedType, page: number = 1): Promise<HNItem[]> => {
    const response = await fetch(`${HN_API_BASE}/${feedType}/${page}.json`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${feedType} feed`);
    }
    return response.json();
};

export const fetchItem = async (id: number): Promise<HNItem> => {
    const response = await fetch(`${HN_API_BASE}/item/${id}.json`);
    if (!response.ok) {
        throw new Error(`Failed to fetch item ${id}`);
    }
    return response.json();
};

export const fetchUser = async (id: string): Promise<HNUser> => {
    const response = await fetch(`${HN_API_BASE}/user/${id}.json`);
    if (!response.ok) {
        throw new Error(`Failed to fetch user ${id}`);
    }
    return response.json();
};
