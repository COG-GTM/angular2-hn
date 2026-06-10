import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import FeedItem from '../components/FeedItem';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useFeed } from '../hooks/useHackerNews';

export default function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;

    const { data: items, isLoading, isError } = useFeed(feedType, pageNum);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * 30 + 1;

    if (isLoading) {
        return (
            <div className="main-content">
                <Loading />
            </div>
        );
    }

    if (isError || !items) {
        return (
            <div className="main-content">
                <ErrorMessage message={`Could not load ${feedType} stories.`} />
            </div>
        );
    }

    return (
        <div className="main-content">
            {feedType === 'jobs' && (
                <p className="job-header">
                    These are jobs at startups that were funded by Y Combinator. You can also get
                    a job at a YC startup through{' '}
                    <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                </p>
            )}
            <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                {items.map((item) => (
                    <li key={item.id} className="post">
                        <FeedItem item={item} />
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
    );
}
