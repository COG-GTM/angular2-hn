import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchFeed } from '../services/api';
import type { Story } from '../types';
import Item from '../components/Item';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/feed.scss';

export default function Feed({ feedType }: { feedType: string }) {
    const { page = '1' } = useParams();
    const pageNum = Number(page) || 1;
    const [items, setItems] = useState<Story[]>();
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        const controller = new AbortController();
        setItems(undefined); setErrorMessage('');
        fetchFeed(feedType, pageNum, { signal: controller.signal }).then(setItems).catch((error: Error) => {
            if (error.name !== 'AbortError') setErrorMessage(`Could not load ${feedType} stories.`);
        }).finally(() => window.scrollTo(0, 0));
        return () => controller.abort();
    }, [feedType, pageNum]);
    const listStart = (pageNum - 1) * 30 + 1;
    return <div className="main-content">
        {!items && !errorMessage && <Loader />}
        {!items && errorMessage && <ErrorMessage message={errorMessage} />}
        {items && <>
            {feedType === 'jobs' && <p className="job-header">These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.</p>}
            <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>{items.map((item) => <li key={item.id} className="post"><Item item={item} /></li>)}</ol>
            <div className="nav">{listStart !== 1 && <Link to={`/${feedType}/${pageNum - 1}`} className="prev">‹ Prev</Link>}{items.length === 30 && <Link to={`/${feedType}/${pageNum + 1}`} className="more">More ›</Link>}</div>
        </>}
    </div>;
}
