import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../../shared/components/ErrorMessage/ErrorMessage';
import Loader from '../../shared/components/Loader/Loader';
import type { Story } from '../../shared/models/story';
import { fetchFeed } from '../../shared/services/hackerNewsApi';
import Item from '../Item/Item';
import './Feed.scss';

export default function Feed() {
    const { feedType = 'news', page } = useParams();
    const pageNum = page ? +page : 1;

    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState(1);

    useEffect(() => {
        const controller = new AbortController();

        setItems(null);
        setErrorMessage('');

        fetchFeed(feedType, pageNum, controller.signal)
            .then(
                (feedItems) => {
                    if (controller.signal.aborted) {
                        return;
                    }
                    setItems(feedItems);
                },
                () => {
                    if (controller.signal.aborted) {
                        return;
                    }
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            )
            .then(() => {
                if (controller.signal.aborted) {
                    return;
                }
                setListStart(((pageNum - 1) * 30) + 1);
                window.scrollTo(0, 0);
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
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a
                            YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    {feedType !== 'new' && (
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
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
