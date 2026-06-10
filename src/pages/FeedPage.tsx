import { useParams, Link } from 'react-router-dom';
import { Story } from '../models/story';
import { fetchFeed, useApiFetch } from '../hooks/useHackerNewsApi';
import Item from '../components/feeds/Item';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';
import './FeedPage.scss';

interface FeedPageProps {
    feedType: string;
}

export default function FeedPage({ feedType }: FeedPageProps) {
    const params = useParams<{ page: string }>();
    const pageNum = params.page ? +params.page : 1;

    const { data: items, error } = useApiFetch<Story[]>(
        () => fetchFeed(feedType, pageNum),
        [feedType, pageNum],
        `Could not load ${feedType} stories.`,
        () => window.scrollTo(0, 0),
    );

    const listStart = (pageNum - 1) * 30 + 1;

    return (
        <div className="main-content feed-view">
            {!items && !error && <Loader />}
            {!items && error !== '' && <ErrorMessage message={error} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can
                            also get a job at a YC startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <Item item={item} />
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
