import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeed } from '../../services/hackerNewsApi';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Item from '../Item/Item';
import type { Story } from '../../types';
import './Feed.scss';

interface FeedProps {
    feedType: string;
    pageNum: number;
}

export default function Feed({ feedType, pageNum }: FeedProps) {
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
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
            {!items && errorMessage && <ErrorMessage message={errorMessage} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also
                            get a job at a YC startup through{' '}
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
