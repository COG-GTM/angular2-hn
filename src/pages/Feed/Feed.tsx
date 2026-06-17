import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSettings } from '../../contexts/SettingsContext';
import { fetchFeed } from '../../services/hackernews-api';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { FeedItem } from './FeedItem';
import './Feed.scss';

export function Feed() {
    const { page } = useParams<{ page: string }>();
    const location = useLocation();
    const { settings } = useSettings();

    const pathSegments = location.pathname.split('/');
    const feedType = pathSegments[1] || 'news';
    const pageNum = page ? parseInt(page, 10) : 1;
    const listStart = (pageNum - 1) * 30 + 1;

    const { data: items, isLoading, error } = useQuery({
        queryKey: ['feed', feedType, pageNum],
        queryFn: () => fetchFeed(feedType, pageNum),
    });

    if (isLoading) return <div className="main-content"><Loader /></div>;
    if (error) return <div className="main-content"><ErrorMessage message={`Could not load ${feedType} stories.`} /></div>;

    return (
        <div className="main-content">
            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a
                            YC startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol
                        className={feedType !== 'jobs' ? 'list-margin' : undefined}
                        start={listStart}
                    >
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <FeedItem item={item} settings={settings} />
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
