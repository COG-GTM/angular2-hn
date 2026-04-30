import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Story } from '../../types/story';
import { fetchFeed } from '../../services/hackernews-api';
import Item from '../../components/Item/Item';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './Feed.scss';

const VALID_FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

export default function Feed() {
    const { feedType = 'news', page = '1' } = useParams<{ feedType: string; page: string }>();
    const pageNum = parseInt(page, 10) || 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const listStart = ((pageNum - 1) * 30) + 1;

    useEffect(() => {
        setItems(null);
        setErrorMessage('');

        if (!VALID_FEED_TYPES.includes(feedType!)) {
            setErrorMessage(`Invalid feed type: ${feedType}`);
            return;
        }

        const controller = new AbortController();
        fetchFeed(feedType!, pageNum, controller.signal)
            .then((data) => {
                setItems(data);
                window.scrollTo(0, 0);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            });

        return () => controller.abort();
    }, [feedType, pageNum]);

    return (
        <div className="main-content">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage && <ErrorMessage message={errorMessage} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    {feedType !== 'new' && (
                        <ol
                            className={feedType !== 'jobs' ? 'list-margin' : ''}
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
