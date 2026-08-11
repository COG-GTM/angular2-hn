import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Item from '../Item/Item';
import Loader from '../Loader/Loader';
import { fetchFeed } from '../../api/hackerNewsApi';
import type { Story } from '../../models/story';
import './Feed.scss';

export default function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const listStart = (pageNum - 1) * 30 + 1;
    const feedItems = Array.isArray(items) ? items : [];

    useEffect(() => {
        const controller = new AbortController();
        setItems(null);
        setErrorMessage('');

        fetchFeed(feedType, pageNum, controller.signal)
            .then((stories) => {
                setItems(stories);
                window.scrollTo(0, 0);
            })
            .catch((error: Error) => {
                if (error.name !== 'AbortError') {
                    setErrorMessage('Could not load ' + feedType + ' stories.');
                }
            });

        return () => controller.abort();
    }, [feedType, pageNum]);

    return (
        <div className="feed main-content">
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
                        {feedItems.map((item) => (
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
                        {feedItems.length === 30 && (
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
