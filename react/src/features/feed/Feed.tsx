import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useFeedPage } from '../../app/use-feed-page';
import { ErrorMessage, Loader } from '../../shared/components';
import { FeedRoute, Story } from '../../shared/models';
import { hackerNewsApi } from '../../shared/services/hackernews-api';
import { StoryItem } from './StoryItem';
import './Feed.scss';

export function Feed({ feedType }: { feedType: FeedRoute }) {
    const [items, setItems] = useState<Story[]>();
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState(1);
    const page = useFeedPage();

    useEffect(() => {
        let cancelled = false;

        setItems(undefined);
        setErrorMessage('');
        hackerNewsApi.fetchFeed(feedType, page).then(
            (result) => {
                if (cancelled) {
                    return;
                }

                setItems(result);
                setListStart((page - 1) * 30 + 1);
                window.scrollTo(0, 0);
            },
            () => {
                if (cancelled) {
                    return;
                }

                setErrorMessage('Could not load ' + feedType + ' stories.');
            }
        );

        return () => {
            cancelled = true;
        };
    }, [feedType, page]);

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
                                <div className="item-block">
                                    <StoryItem item={item} />
                                </div>
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link className="prev" to={`/${feedType}/${page - 1}`}>
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
                            <Link className="more" to={`/${feedType}/${page + 1}`}>
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
