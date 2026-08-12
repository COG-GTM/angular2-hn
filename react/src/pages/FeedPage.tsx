import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useFeed } from '../api/queries';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import StoryItem from '../components/StoryItem';
import './FeedPage.scss';

export default function FeedPage() {
    const { feedType = 'news', page } = useParams();
    const pageNum = page ? Number(page) : 1;
    const { data: items, isPending, isError } = useFeed(feedType, pageNum);
    const listStart = (pageNum - 1) * 30 + 1;

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    return (
        <div className="main-content">
            {isPending && <Loader />}
            {isError && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    {feedType !== 'new' && (
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <div className="item-block">
                                        <StoryItem item={item} />
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
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
