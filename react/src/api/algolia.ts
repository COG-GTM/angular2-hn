import type { Story } from '../models';

const ALGOLIA_BASE_URL = 'https://hn.algolia.com/api/v1';

export interface AlgoliaHit {
    objectID: string;
    title: string;
    url: string | null;
    points: number;
    author: string;
    num_comments: number;
    created_at_i: number;
}

interface AlgoliaSearchResponse {
    hits: AlgoliaHit[];
}

function domainOf(url: string | null): string {
    if (!url) {
        return '';
    }
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}

export function mapHitToStory(hit: AlgoliaHit): Story {
    return {
        id: Number(hit.objectID),
        title: hit.title,
        points: hit.points,
        user: hit.author,
        time: hit.created_at_i,
        time_ago: new Date(hit.created_at_i * 1000).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }),
        type: 'story',
        url: hit.url ?? '',
        domain: domainOf(hit.url),
        comments: [],
        comments_count: hit.num_comments ?? 0,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };
}

export async function fetchFrontPageForDate(date: Date, hitsPerPage = 30): Promise<Story[]> {
    const start = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 1000);
    const end = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime() / 1000);

    const params = new URLSearchParams({
        tags: 'story',
        numericFilters: `created_at_i>=${start},created_at_i<${end}`,
        hitsPerPage: String(hitsPerPage),
    });

    const res = await fetch(`${ALGOLIA_BASE_URL}/search?${params.toString()}`);
    if (!res.ok) {
        throw new Error(`Algolia request failed with status ${res.status}`);
    }
    const data = (await res.json()) as AlgoliaSearchResponse;

    return data.hits
        .slice()
        .sort((a, b) => b.points - a.points)
        .map(mapHitToStory);
}
