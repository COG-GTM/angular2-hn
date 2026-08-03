import { Link, useParams } from 'react-router-dom';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Item } from '../../components/Item/Item';
import { Loader } from '../../components/Loader/Loader';
import { useRequest } from '../../hooks/useRequest';
import type { FeedType, Story } from '../../models';
import { fetchFeed } from '../../services/hackernewsApi';
import './Feed.scss';

export const ITEMS_PER_PAGE = 30;

export function Feed({ feedType }: { feedType: FeedType }) {
    const { page } = useParams();
    const pageNum = page ? Number(page) : 1;

    const { data: items, error } = useRequest<Story[]>(
        (signal) => fetchFeed(feedType, pageNum, signal),
        `Could not load ${feedType} stories.`,
        [feedType, pageNum],
        () => window.scrollTo(0, 0)
    );

    const listStart = (pageNum - 1) * ITEMS_PER_PAGE + 1;

    return (
        <div className="main-content">
            {!items && !error && <Loader />}
            {!items && error !== '' && <ErrorMessage message={error} />}

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
                                    <Item item={item} />
                                </div>
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                &lsaquo; Prev
                            </Link>
                        )}
                        {items.length === ITEMS_PER_PAGE && (
                            <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                More &rsaquo;
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Feed;
