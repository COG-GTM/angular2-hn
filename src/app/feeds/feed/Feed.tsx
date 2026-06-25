import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFeed } from '../../shared/hooks/useHackerNews';
import { Loader } from '../../shared/components/loader/Loader';
import { ErrorMessage } from '../../shared/components/error-message/ErrorMessage';
import { Item } from '../item/Item';
import './feed.component.scss';

interface FeedProps {
    feedType: string;
}

export function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? parseInt(page, 10) : 1;
    const { data: items, error, isLoading } = useFeed(feedType, pageNum);
    const listStart = (pageNum - 1) * 30 + 1;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [feedType, pageNum]);

    return (
        <div className="main-content">
            {isLoading && !error && <Loader />}
            {!isLoading && error && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    {feedType !== 'new' && (
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <Item item={item} />
                                </li>
                            ))}
                        </ol>
                    )}
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                &#8249; Prev
                            </Link>
                        )}
                        {items.length === 30 && (
                            <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                More &#8250;
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
