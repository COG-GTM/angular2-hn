import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Story } from '../../types/story';
import { fetchFeed } from '../../api/hackernews';
import { Item } from '../Item/Item';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import './Feed.scss';

export function Feed() {
    const params = useParams();
    const feedType = params.feedType ?? 'news';
    const page = params.page ? +params.page : 1;

    const [items, setItems] = useState<Story[] | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState(1);
    const prevFeedType = useRef(feedType);

    useEffect(() => {
        if (prevFeedType.current !== feedType) {
            setItems(undefined);
            setErrorMessage('');
            prevFeedType.current = feedType;
        }
    }, [feedType]);

    useEffect(() => {
        let cancelled = false;
        setErrorMessage('');
        fetchFeed(feedType, page)
            .then((data) => {
                if (cancelled) {
                    return;
                }
                setItems(data);
                setListStart((page - 1) * 30 + 1);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage('Could not load ' + feedType + ' stories.');
                }
            });
        return () => {
            cancelled = true;
        };
    }, [feedType, page]);

    return (
        <div className="main-content feed">
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
                                    <Item item={item} />
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
                        {items.length === 30 && (
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

export default Feed;
