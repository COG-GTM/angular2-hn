import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../api/hackerNewsApi';
import type { Story } from '../models';
import { ErrorMessage } from './ErrorMessage';
import { Item } from './Item';
import { Loader } from './Loader';
import './Feed.scss';

export function Feed() {
    const params = useParams<{ feedType: string; page: string }>();
    const feedType = params.feedType ?? 'news';
    const pageNum = params.page ? +params.page : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let active = true;
        setItems(null);
        setErrorMessage('');

        fetchFeed(feedType, pageNum)
            .then((stories) => {
                if (!active) {
                    return;
                }
                setItems(stories);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (active) {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            });

        return () => {
            active = false;
        };
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
                    {feedType !== 'new' && (
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
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
