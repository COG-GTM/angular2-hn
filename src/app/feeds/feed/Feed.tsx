import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchFeed } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';
import { Loader } from '../../shared/components/loader/Loader';
import { ErrorMessage } from '../../shared/components/error-message/ErrorMessage';
import { Item } from '../item/Item';
import './feed.scss';

interface FeedProps {
    feedType: string;
}

export function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const pageNum = page ? +page : 1;
    const listStart = (pageNum - 1) * 30 + 1;

    useEffect(() => {
        setItems(null);
        setErrorMessage('');
        const controller = new AbortController();
        fetchFeed(feedType, pageNum, controller.signal)
            .then((data) => {
                setItems(data);
                window.scrollTo(0, 0);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setErrorMessage('Could not load ' + feedType + ' stories.');
                }
            });
        return () => controller.abort();
    }, [feedType, pageNum]);

    return (
        <div className="main-content">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
