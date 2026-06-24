import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFeed } from '../hooks/useFeed';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import FeedItem from '../components/FeedItem';
import '../styles/Feed.scss';

interface FeedProps {
    feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? parseInt(page, 10) : 1;
    const { items, error } = useFeed(feedType, pageNum);
    const listStart = (pageNum - 1) * 30 + 1;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [feedType, pageNum]);

    return (
        <div className="main-content">
            {!items && !error && <Loader />}
            {!items && error && <ErrorMessage message={error} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol
                        className={feedType !== 'jobs' ? 'list-margin' : undefined}
                        start={listStart}
                    >
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <span className="item-block">
                                    <FeedItem item={item} />
                                </span>
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
