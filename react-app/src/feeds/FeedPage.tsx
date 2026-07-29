import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { FeedName } from '../shared/models';
import { useFeed } from '../shared/hooks';
import { ErrorMessage, Loader } from '../shared/components';
import ItemRow from './ItemRow';
import './FeedPage.scss';

interface FeedPageProps {
    feedType: FeedName;
}

export default function FeedPage({ feedType }: FeedPageProps) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;
    const { data: items, loading, error } = useFeed(feedType, pageNum);
    const listStart = ((pageNum - 1) * 30) + 1;

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    return (
        <div className="main-content">
            {loading && <Loader />}
            {!items && error && <ErrorMessage message={'Could not load ' + feedType + ' stories.'} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator.
                            You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <ItemRow className="item-block" item={item} />
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
