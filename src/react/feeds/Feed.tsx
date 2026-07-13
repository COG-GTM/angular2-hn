import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';

import { Story } from '../models/story';
import { fetchFeed } from '../services/hackernews-api';
import { Loader } from '../components/loader/Loader';
import { ErrorMessage } from '../components/error-message/ErrorMessage';
import { Item } from './Item';
import './Feed.scss';

interface FeedProps {
    feedType: string;
}

export const Feed = ({ feedType }: FeedProps) => {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? +page : 1;

    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [listStart, setListStart] = useState(1);

    useEffect(() => {
        const controller = new AbortController();

        setItems(null);
        setErrorMessage('');

        fetchFeed(feedType, pageNum, controller.signal)
            .then((data) => {
                setItems(data);
                setListStart((pageNum - 1) * 30 + 1);
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (controller.signal.aborted) {
                    return;
                }
                setErrorMessage('Could not load ' + feedType + ' stories.');
            });

        return () => controller.abort();
    }, [feedType, pageNum]);

    return (
        <div className="feed-view">
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
                                        <div className="item-block">
                                            <Item item={item} />
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                        <div className="nav">
                            {listStart !== 1 && (
                                <NavLink to={`/${feedType}/${pageNum - 1}`} className="prev">
                                    ‹ Prev
                                </NavLink>
                            )}
                            {items.length === 30 && (
                                <NavLink to={`/${feedType}/${pageNum + 1}`} className="more">
                                    More ›
                                </NavLink>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
