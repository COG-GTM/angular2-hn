import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import ErrorMessage from '../../shared/components/error-message/ErrorMessage';
import Loader from '../../shared/components/loader/Loader';
import type { FeedName, Story } from '../../shared/models';
import { fetchFeed } from '../../shared/api/hackernewsApi';
import Item from '../item/Item';
import './Feed.scss';

interface FeedProps {
    feedType: FeedName;
}

function Feed({ feedType }: FeedProps) {
    const params = useParams<{ page?: string }>();
    const pageNum = params.page ? Number(params.page) : 1;
    const [items, setItems] = useState<Story[]>();
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState(0);

    useEffect(() => {
        let ignore = false;
        setErrorMessage('');

        fetchFeed(feedType, pageNum)
            .then((nextItems) => {
                if (ignore) {
                    return;
                }

                setItems(nextItems);
                setListStart((pageNum - 1) * 30 + 1);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (!ignore) {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            });

        return () => {
            ignore = true;
        };
    }, [feedType, pageNum]);

    return (
        <div className="main-content">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator.
                            You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    {feedType as string !== 'new' && (
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {items.map((item) => (
                                <li className="post" key={item.id}>
                                    <Item className="item-block" item={item} />
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

export default Feed;
