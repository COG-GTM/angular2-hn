import { useEffect } from 'react';
import { Link } from 'react-router';

import { useFeedType, usePageNumber } from '../router';
import { ErrorMessage, Loader } from '../shared/components';
import { useFeed } from '../shared/hooks';
import { PAGE_SIZE } from '../shared/models';
import { listStart } from '../shared/utils';
import { Item } from './Item';
import './Feed.scss';

// Port of src/app/feeds/feed.
export function Feed() {
    const feedType = useFeedType();
    const page = usePageNumber();
    const { data: items, isError } = useFeed(feedType, page);
    const hasItems = items !== undefined;

    useEffect(() => {
        if (hasItems) {
            window.scrollTo(0, 0);
        }
    }, [feedType, page, hasItems]);

    return (
        <div className="main-content feed" data-feed={feedType} data-page={page}>
            {!items && !isError && <Loader />}
            {!items && isError && <ErrorMessage message={`Could not load ${feedType} stories.`} />}
            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart(page, PAGE_SIZE)}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <Item item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {page > 1 && (
                            <Link to={`/${feedType}/${page - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === PAGE_SIZE && (
                            <Link to={`/${feedType}/${page + 1}`} className="more">
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
