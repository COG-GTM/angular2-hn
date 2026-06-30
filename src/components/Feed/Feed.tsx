import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Story } from '../../models/story';
import { fetchFeed } from '../../api/hackerNews';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Item from '../Item/Item';
import './Feed.scss';

export default function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;

    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState(1);

    useEffect(() => {
        const controller = new AbortController();
        setItems(null);
        setErrorMessage('');

        fetchFeed(feedType, pageNum, controller.signal)
            .then((feedItems) => {
                setItems(feedItems);
                setListStart((pageNum - 1) * 30 + 1);
                window.scrollTo(0, 0);
            })
            .catch((error) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setErrorMessage('Could not load ' + feedType + ' stories.');
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
