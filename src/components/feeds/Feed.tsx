import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { FeedName } from '../../models/feed-type.type';
import { Story } from '../../models/story';
import { fetchFeed } from '../../services/hackernewsApi';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Item from './Item';
import './Feed.scss';

export default function Feed() {
    const { pathname } = useLocation();
    const { page } = useParams();
    const feedType = pathname.split('/')[1] as FeedName;
    const pageNum = page ? +page : 1;

    const [items, setItems] = useState<Story[] | null>(null);
    const [listStart, setListStart] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setItems(null);
        setErrorMessage('');

        fetchFeed(feedType, pageNum)
            .then(stories => {
                if (cancelled) {
                    return;
                }
                setItems(stories);
                setListStart((pageNum - 1) * 30 + 1);
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

    return (
        <div className="feed-view main-content">
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
                        {items.map(item => (
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
