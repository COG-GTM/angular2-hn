import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../api/hackernews';
import ErrorMessage from '../components/ErrorMessage';
import Item from '../components/Item';
import Loader from '../components/Loader';
import type { Story } from '../models';
import './Feed.scss';

function Feed() {
    const params = useParams();
    const feedType = params.feedType ?? 'news';
    const page = params.page ? Number(params.page) : 1;

    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState(1);

    useEffect(() => {
        let cancelled = false;
        setItems(null);
        setErrorMessage('');

        fetchFeed(feedType, page)
            .then((stories) => {
                if (cancelled) {
                    return;
                }
                setItems(stories);
                setListStart(((page - 1) * 30) + 1);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [feedType, page]);

    return (
        <div className='main-content'>
            {!items && !errorMessage && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className='job-header'>
                            These are jobs at startups that were funded by Y Combinator.
                            You can also get a job at a YC startup through <a href='https://triplebyte.com/?ref=yc_jobs'>Triplebyte</a>.
                        </p>
                    )}
                    {feedType !== 'new' && (
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {items.map((item) => (
                                <li key={item.id} className='post'>
                                    <div className='item-block'>
                                        <Item item={item} />
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                    <div className='nav'>
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${page - 1}`} className='prev'>
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
                            <Link to={`/${feedType}/${page + 1}`} className='more'>
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
