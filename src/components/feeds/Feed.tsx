import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { Story } from '../../models/story';
import { fetchFeed } from '../../services/hackernews-api';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Item from './Item';
import './Feed.scss';

export default function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? +page : 1;
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
                    setErrorMessage('Could not load ' + feedType + ' stories.');
                    console.error(error);
                }
            });

        return () => controller.abort();
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * 30 + 1;

    return (
        <div className="c-feed main-content">
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
                                <div className="item-block">
                                    <Item item={item} />
                                </div>
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
