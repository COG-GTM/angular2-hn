import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../../shared/api/hackernews-api';
import ErrorMessage from '../../shared/components/ErrorMessage';
import Loader from '../../shared/components/Loader';
import type { FeedName } from '../../shared/models/feed-name.type';
import type { Story } from '../../shared/models/story';
import FeedItem from './FeedItem';
import './FeedPage.scss';

export const ITEMS_PER_PAGE = 30;

interface FeedPageProps {
    feedType: FeedName;
}

export default function FeedPage({ feedType }: FeedPageProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? Number(page) : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setItems(null);
        setErrorMessage('');

        fetchFeed(feedType, pageNum)
            .then((stories) => {
                if (cancelled) {
                    return;
                }
                setItems(stories);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * ITEMS_PER_PAGE + 1;

    return (
        <div className="main-content">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <FeedItem item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === ITEMS_PER_PAGE && (
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
