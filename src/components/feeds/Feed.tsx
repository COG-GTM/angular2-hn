import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchFeed } from '../../api/hackerNewsApi';
import type { FeedName, Story } from '../../models';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Item from './Item';
import './Feed.scss';

interface FeedProps {
    feedType: FeedName;
}

export default function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? Number(page) : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItems(null);
        setErrorMessage('');

        fetchFeed(feedType, pageNum, controller.signal)
            .then((stories) => {
                setItems(stories);
                window.scrollTo(0, 0);
            })
            .catch((error: unknown) => {
                if (!controller.signal.aborted) {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
                return error;
            });

        return () => controller.abort();
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
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
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
