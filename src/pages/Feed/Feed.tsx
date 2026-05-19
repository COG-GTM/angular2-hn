import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchFeed } from '../../services/hackernews-api';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Item } from './Item';
import type { Story } from '../../types';
import './Feed.scss';

interface FeedProps {
    feedType: string;
}

export function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? parseInt(page, 10) : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setItems(null);
        setErrorMessage('');
        fetchFeed(feedType, pageNum)
            .then((data) => {
                if (!cancelled) {
                    setItems(data);
                    window.scrollTo(0, 0);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            });
        return () => { cancelled = true; };
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * 30 + 1;

    return (
        <div className="main-content">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
                            className={feedType !== 'jobs' ? 'list-margin' : undefined}
                            start={listStart}
                        >
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <Item item={item} />
                                </li>
                            ))}
                        </ol>
                    )}
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
