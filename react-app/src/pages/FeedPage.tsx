import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';
import { Item } from '../components/Item/Item';
import { Loader } from '../components/Loader/Loader';
import { fetchFeed } from '../services/hackerNewsApi';
import type { FeedName, Story } from '../types';
import './FeedPage.scss';

export function FeedPage({ feedType }: { feedType: FeedName }) {
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const { page: pageParam } = useParams();
    const page = Number(pageParam) || 1;
    useEffect(() => {
        const controller = new AbortController();
        setItems(null);
        setErrorMessage('');
        fetchFeed(feedType, page, controller.signal).then(setItems).catch((error: unknown) => {
            if ((error as Error).name !== 'AbortError') setErrorMessage(`Could not load ${feedType} stories.`);
        });
        window.scrollTo(0, 0);
        return () => controller.abort();
    }, [feedType, page]);
    const listStart = (page - 1) * 30 + 1;
    if (!items && !errorMessage) return <div className="main-content"><Loader /></div>;
    if (!items) return <div className="main-content"><ErrorMessage message={errorMessage} /></div>;
    return <div className="main-content">
        {feedType === 'jobs' && <p className="job-header">These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.</p>}
        <ol start={listStart} className={feedType !== 'jobs' ? 'list-margin' : undefined}>
            {items.map((item) => <li key={item.id} className="post"><Item item={item} /></li>)}
        </ol>
        <div className="nav">
            {listStart !== 1 && <Link className="prev" to={`/${feedType}/${page - 1}`}>‹ Prev</Link>}
            {items.length === 30 && <Link className="more" to={`/${feedType}/${page + 1}`}>More ›</Link>}
        </div>
    </div>;
}
