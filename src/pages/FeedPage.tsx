import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useFeed } from '../hooks';
import Item from '../components/Item';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import './FeedPage.scss';

// Port of src/app/feeds/feed/feed.component.{ts,html,scss}
export default function FeedPage() {
    const location = useLocation();
    const params = useParams();
    // feedType comes from the first path segment (/news, /newest, /show, /ask, /jobs).
    const feedType = location.pathname.split('/')[1] || 'news';
    const page = params.page ? +params.page : 1;

    const { stories, loading, error } = useFeed(feedType, page);

    const listStart = (page - 1) * 30 + 1;

    useEffect(() => {
        if (!loading && !error) {
            window.scrollTo(0, 0);
        }
    }, [loading, error, feedType, page]);

    return (
        <div className="main-content">
            {loading && !error && <Loader />}
            {error && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

            {!loading && !error && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also
                            get a job at a YC startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    {feedType !== 'new' && (
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {stories.map((item) => (
                                <li key={item.id} className="post">
                                    <div className="item-block">
                                        <Item item={item} />
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${page - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {stories.length === 30 && (
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
