import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Story } from '../../models/story';
import { FeedName } from '../../models/feed-type';
import { fetchFeed } from '../../services/hackerNewsApi';
import { Item } from '../Item/Item';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import './Feed.scss';

interface FeedProps {
    feedType: FeedName;
}

export function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? +page : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState(1);

    useEffect(() => {
        let cancelled = false;
        setItems(null);
        setErrorMessage('');
        fetchFeed(feedType, pageNum)
            .then((data) => {
                if (!cancelled) {
                    setItems(data);
                    setListStart((pageNum - 1) * 30 + 1);
                    window.scrollTo(0, 0);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage('Could not load ' + feedType + ' stories.');
                }
            });
        return () => { cancelled = true; };
    }, [feedType, pageNum]);

    return (
        <div className="main-content">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
