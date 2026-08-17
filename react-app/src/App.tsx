import { useEffect, useState } from 'react';
import { fetchFeed } from './services/hackernewsApi';
import type { Story } from './models/story';
import './App.css';

function App() {
    const [stories, setStories] = useState<Story[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchFeed('news', 1)
            .then((feed) => {
                if (cancelled) {
                    return;
                }
                console.log('fetchFeed("news", 1)', feed);
                setStories(feed);
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : String(err));
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main>
            <h1>Hacker News data layer smoke test</h1>
            {loading && <p>Loading…</p>}
            {error && <p role="alert">Failed to load feed: {error}</p>}
            <ol>
                {stories.map((story) => (
                    <li key={story.id}>
                        <a href={story.url}>{story.title}</a> — {story.points} points by {story.user}
                    </li>
                ))}
            </ol>
        </main>
    );
}

export default App;
