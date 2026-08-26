import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from './ErrorMessage';
import Item from './Item';
import Loader from './Loader';
import { fetchFeed } from '../api/hackernews';
import { FeedName } from '../models/feed-name.type';
import { Story } from '../models/story';
import './Feed.scss';

interface FeedProps {
    feedName: FeedName;
}

export default function Feed({ feedName }: FeedProps) {
    const { page } = useParams<'page'>();
    const pageNum = page ? +page : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState<number>();

    useEffect(() => {
        let ignore = false;

        setErrorMessage('');
        fetchFeed(feedName, pageNum)
            .then(nextItems => {
                if (ignore) {
                    return;
                }

                setItems(nextItems);
                setListStart((pageNum - 1) * 30 + 1);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (ignore) {
                    return;
                }

                setErrorMessage('Could not load ' + feedName + ' stories.');
            });

        return () => {
            ignore = true;
        };
    }, [feedName, pageNum]);

    return (
        <div className="main-content">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage && <ErrorMessage message={errorMessage} />}
            {items && (
                <div>
                    {feedName === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator.
                            You can also get a job at a YC startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedName !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map(item => (
                            <li key={item.id} className="post">
                                <Item item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link className="prev" to={`/${feedName}/${pageNum - 1}`}>
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
                            <Link className="more" to={`/${feedName}/${pageNum + 1}`}>
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
