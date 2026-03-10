import { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { fetchFeed } from '../services/hackernews-api';
import Item from '../components/Item';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import type { Story } from '../types/story';
import '../styles/Feed.scss';

const VALID_FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

export default function Feed() {
    const { feedType, page } = useParams<{ feedType: string; page: string }>();
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [fetchKey, setFetchKey] = useState('');

    const pageNum = page ? parseInt(page, 10) : 1;
    const listStart = (pageNum - 1) * 30 + 1;
    const currentKey = `${feedType}-${pageNum}`;
    const loading = fetchKey !== currentKey || (!items && !errorMessage);

    useEffect(() => {
        if (!feedType || !VALID_FEED_TYPES.includes(feedType)) return;
        let cancelled = false;

        fetchFeed(feedType, pageNum)
            .then((data) => {
                if (!cancelled) {
                    setItems(data);
                    setErrorMessage('');
                    setFetchKey(`${feedType}-${pageNum}`);
                    window.scrollTo(0, 0);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setItems(null);
                    setErrorMessage('Could not load ' + feedType + ' stories.');
                    setFetchKey(`${feedType}-${pageNum}`);
                }
            });

        return () => { cancelled = true; };
    }, [feedType, pageNum]);

    if (!feedType || !VALID_FEED_TYPES.includes(feedType)) {
        return <Navigate to="/news/1" replace />;
    }

    return (
        <div className="main-content">
            {loading && <Loader />}
            {!loading && !items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    {feedType !== 'new' && (
                        <ol
                            className={feedType !== 'jobs' ? 'list-margin' : ''}
                            start={listStart}
                        >
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <div className="item-block">
                                        <Item item={item} />
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                &#8249; Prev
                            </Link>
                        )}
                        {items.length === 30 && (
                            <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                More &#8250;
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
