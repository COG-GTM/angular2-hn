import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Story } from '../types/story';
import { fetchFeed } from '../services/hackerNewsApi';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { Item } from '../components/Item';

interface FeedPageProps {
    feedType: string;
}

export function FeedPage({ feedType }: FeedPageProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? parseInt(page, 10) : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItems(null);
        setErrorMessage('');
        fetchFeed(feedType, pageNum, controller.signal)
            .then((data) => {
                setItems(data);
                window.scrollTo(0, 0);
            })
            .catch((err) => {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setErrorMessage(`Could not load ${feedType} stories.`);
            });
        return () => controller.abort();
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * 30 + 1;

    return (
        <div className="main-content">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage && <ErrorMessage message={errorMessage} />}
            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can
                            also get a job at a YC startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol
                        className={feedType !== 'jobs' ? 'feed-list list-margin' : 'feed-list'}
                        start={listStart}
                    >
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <Item item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
                            <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
