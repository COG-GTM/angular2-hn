import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { FeedType, Story } from '../models';
import { fetchFeed, PAGE_SIZE } from '../services/hackernewsApi';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Item from './Item';
import './Feed.scss';

export default function Feed({ feedType }: { feedType: FeedType }) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [listStart, setListStart] = useState<number>();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        fetchFeed(feedType, pageNum, controller.signal).then(
            (stories) => {
                setItems(stories);
                setListStart((pageNum - 1) * PAGE_SIZE + 1);
                window.scrollTo(0, 0);
            },
            () => {
                if (!controller.signal.aborted) setErrorMessage(`Could not load ${feedType} stories.`);
            }
        );
        return () => controller.abort();
    }, [feedType, pageNum]);

    return (
        <div className="main-content">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            {' These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>
                            {'. '}
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
                                {' ‹ Prev '}
                            </Link>
                        )}
                        {items.length === PAGE_SIZE && (
                            <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                {' More › '}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
