import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../api/hackerNews';
import ErrorMessage from '../components/ErrorMessage';
import Item from '../components/Item';
import Loader from '../components/Loader';
import type { Story } from '../models/story';

import './Feed.scss';

const PAGE_SIZE = 30;

export default function Feed() {
    const { feedType = 'news', page } = useParams<{ feedType: string; page: string }>();
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
                if (controller.signal.aborted) {
                    return;
                }
                console.error(error);
                setErrorMessage(`Could not load ${feedType} stories.`);
            });

        return () => controller.abort();
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * PAGE_SIZE + 1;

    if (!items) {
        return <div className="main-content">{errorMessage ? <ErrorMessage message={errorMessage} /> : <Loader />}</div>;
    }

    return (
        <div className="main-content">
            {feedType === 'jobs' && (
                <p className="job-header">
                    These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup
                    through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
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
                {items.length === PAGE_SIZE && (
                    <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                        More ›
                    </Link>
                )}
            </div>
        </div>
    );
}
