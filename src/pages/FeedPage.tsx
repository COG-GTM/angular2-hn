import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';

import { fetchFeed } from '../api/hackerNews';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { Item } from '../feeds/Item';
import { Story } from '../models/story';
import '../feeds/feed.scss';

export interface FeedPageProps {
    feedType: string;
}

export function FeedPage({ feedType }: FeedPageProps) {
    const { page } = useParams();
    const pageNum = page ? Number(page) : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;

        setItems(null);
        setErrorMessage('');

        fetchFeed(feedType, pageNum).then(
            (feedItems) => {
                if (cancelled) {
                    return;
                }
                setItems(feedItems);
                window.scrollTo(0, 0);
            },
            () => {
                if (!cancelled) {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            }
        );

        return () => {
            cancelled = true;
        };
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * 30 + 1;

    return (
        <div className="main-content">
            {!items && errorMessage === '' && <Loader />}
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
                                    <Item className="item-block" item={item} />
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
    );
}

export default FeedPage;
