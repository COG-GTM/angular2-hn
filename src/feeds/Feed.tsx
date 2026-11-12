import { useEffect } from 'react';
import { NavLink, useParams } from 'react-router';

import type { Feed as FeedName } from '../shared/models/feed';
import { ErrorMessage } from '../shared/components/ErrorMessage';
import { Loader } from '../shared/components/Loader';
import { scrollTop } from '../shared/utils/scroll';
import { Item } from './Item';
import { useFeed } from './useFeed';
import './Feed.scss';

export const PAGE_SIZE = 30;

export function Feed({ feedType }: { feedType: FeedName }) {
    const params = useParams<{ page: string }>();
    const pageNum = params.page ? Number(params.page) : 1;
    const { data, isError, isPlaceholderData } = useFeed(feedType, pageNum);

    useEffect(() => {
        if (data && !isPlaceholderData) {
            scrollTop();
        }
    }, [data, isPlaceholderData]);

    if (!data) {
        return (
            <div className="app-feed">
                <div className="main-content">
                    {isError ? <ErrorMessage message={`Could not load ${feedType} stories.`} /> : <Loader />}
                </div>
            </div>
        );
    }

    const { items, page } = data;
    const listStart = (page - 1) * PAGE_SIZE + 1;

    return (
        <div className="app-feed">
            <div className="main-content">
                <div>
                    {data.feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={data.feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <Item item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <NavLink to={`/${data.feedType}/${page - 1}`} className="prev">
                                ‹ Prev
                            </NavLink>
                        )}
                        {items.length === PAGE_SIZE && (
                            <NavLink to={`/${data.feedType}/${page + 1}`} className="more">
                                More ›
                            </NavLink>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
