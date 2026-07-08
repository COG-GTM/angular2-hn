import { Link, useParams } from 'react-router-dom';

import { useFeed } from '../hooks/useFeed';
import { Item } from '../components/Item';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import './Feed.scss';

interface FeedProps {
    feedType: string;
}

export function Feed({ feedType }: FeedProps) {
    const params = useParams();
    const pageNum = params.page ? +params.page : 1;
    const { items, errorMessage } = useFeed(feedType, pageNum);
    const listStart = (pageNum - 1) * 30 + 1;

    return (
        <div className="feed-view">
            <div className="main-content">
                {!items && !errorMessage && <Loader />}
                {!items && errorMessage !== '' && (
                    <ErrorMessage message={errorMessage} />
                )}

                {items && (
                    <div>
                        {feedType === 'jobs' && (
                            <p className="job-header">
                                These are jobs at startups that were funded by Y
                                Combinator. You can also get a job at a YC startup
                                through{' '}
                                <a href="https://triplebyte.com/?ref=yc_jobs">
                                    Triplebyte
                                </a>
                                .
                            </p>
                        )}
                        <ol
                            className={feedType !== 'jobs' ? 'list-margin' : undefined}
                            start={listStart}
                        >
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <Item item={item} />
                                </li>
                            ))}
                        </ol>
                        <div className="nav">
                            {listStart !== 1 && (
                                <Link
                                    to={`/${feedType}/${pageNum - 1}`}
                                    className="prev"
                                >
                                    ‹ Prev
                                </Link>
                            )}
                            {items.length === 30 && (
                                <Link
                                    to={`/${feedType}/${pageNum + 1}`}
                                    className="more"
                                >
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
