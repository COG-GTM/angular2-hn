import type { Story, User } from '@/types';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

interface HNItem {
  id: number;
  type: 'story' | 'comment' | 'job' | 'poll' | 'pollopt';
  by?: string;
  time?: number;
  title?: string;
  text?: string;
  url?: string;
  score?: number;
  descendants?: number;
  kids?: number[];
  parts?: number[];
  dead?: boolean;
  deleted?: boolean;
}

interface HNUser {
  id: string;
  created: number;
  karma: number;
  about?: string;
}

const FEED_ENDPOINTS: Record<string, string> = {
  news: 'topstories',
  newest: 'newstories',
  show: 'showstories',
  ask: 'askstories',
  jobs: 'jobstories',
};

const ITEMS_PER_PAGE = 30;

function extractDomain(url: string | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function fetchItem(id: number): Promise<HNItem | null> {
  return fetchJSON<HNItem | null>(`${BASE_URL}/item/${id}.json`);
}

function mapItemToStory(item: HNItem): Story {
  return {
    id: item.id,
    title: item.title ?? '',
    points: item.score ?? 0,
    user: item.by ?? '',
    time: item.time ?? 0,
    time_ago: item.time ? timeAgo(item.time) : '',
    type: item.type === 'job' ? 'job' : item.type === 'poll' ? 'poll' : 'story',
    url: item.url ?? '',
    domain: extractDomain(item.url),
    comments: [],
    comments_count: item.descendants ?? 0,
    poll: [],
    poll_votes_count: 0,
    content: item.text ?? '',
    deleted: item.deleted ?? false,
    dead: item.dead ?? false,
  };
}

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const endpoint = FEED_ENDPOINTS[feedType] ?? 'topstories';
  const ids = await fetchJSON<number[]>(`${BASE_URL}/${endpoint}.json`);

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageIds = ids.slice(start, end);

  const items = await Promise.all(pageIds.map((id) => fetchItem(id)));

  return items.filter((item): item is HNItem => item !== null).map(mapItemToStory);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const item = await fetchItem(id);
  if (!item) {
    throw new Error(`Item ${id} not found`);
  }

  const story = mapItemToStory(item);

  if (item.kids && item.kids.length > 0) {
    story.comments = await fetchComments(item.kids);
  }

  if (item.type === 'poll' && item.parts && item.parts.length > 0) {
    const partItems = await Promise.all(item.parts.map((id) => fetchItem(id)));
    story.poll = partItems
      .filter((p): p is HNItem => p !== null)
      .map((p) => ({ points: p.score ?? 0, content: p.text ?? '' }));
    story.poll_votes_count = story.poll.reduce((sum, p) => sum + p.points, 0);
  }

  return story;
}

async function fetchComments(
  ids: number[],
  level = 0
): Promise<Story['comments']> {
  const items = await Promise.all(ids.map((id) => fetchItem(id)));

  const comments = await Promise.all(
    items
      .filter((item): item is HNItem => item !== null)
      .map(async (item) => {
        const childComments =
          item.kids && item.kids.length > 0
            ? await fetchComments(item.kids, level + 1)
            : [];

        return {
          id: item.id,
          level,
          user: item.by ?? '',
          time: item.time ?? 0,
          time_ago: item.time ? timeAgo(item.time) : '',
          content: item.text ?? '',
          deleted: item.deleted ?? false,
          comments: childComments,
        };
      })
  );

  return comments;
}

export async function fetchUser(id: string): Promise<User> {
  const user = await fetchJSON<HNUser | null>(`${BASE_URL}/user/${id}.json`);
  if (!user) {
    throw new Error(`User ${id} not found`);
  }

  return {
    id: user.id,
    created_time: user.created,
    created: timeAgo(user.created),
    karma: user.karma,
    avg: 0,
    about: user.about ?? '',
  };
}
