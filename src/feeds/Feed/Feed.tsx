import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ErrorMessage } from '../../shared/components/ErrorMessage/ErrorMessage';
import { Loader } from '../../shared/components/Loader/Loader';
import { useFeed } from '../../shared/hooks/use-hackernews';
import { Item } from '../Item/Item';
import type { FeedName } from '../feed-names';
import './Feed.scss';

export function Feed({ feedType }: { feedType: FeedName }) {
    const params = useParams<{ page: string }>();
    const pageNum = params.page ? +params.page : 1;
    const { data: items, isError, isPlaceholderData } = useFeed(feedType, pageNum);
    const listStart = (pageNum - 1) * 30 + 1;

    useEffect(() => {
        if (items && !isPlaceholderData) {
            window.scrollTo(0, 0);
        }
    }, [items, isPlaceholderData]);

    return (
        <div className="feed-page">
            <div className="main-content">
                {!items && !isError && <Loader />}
                {!items && isError && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

                {items && (
                    <div>
                        {feedType === 'jobs' && (
                            <p className="job-header">
                                These are jobs at startups that were funded by Y Combinator. You can also get a job at a
                                YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                            </p>
                        )}
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <Item className="item-block" item={item} />
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
        </div>
    );
}
