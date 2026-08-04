import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';

import { ErrorMessage } from '../../shared/components/ErrorMessage/ErrorMessage';
import { Loader } from '../../shared/components/Loader/Loader';
import { Story } from '../../shared/models';
import { fetchFeed } from '../../shared/services/hackernewsApi';
import { Item } from '../Item/Item';
import './Feed.scss';

interface FeedProps {
    feedType: string;
}

export function Feed({ feedType }: FeedProps) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;
    const [items, setItems] = useState<Story[] | undefined>(undefined);
    const [listStart, setListStart] = useState<number | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    // Angular destroyed and rebuilt the component when the feed changed, but kept it alive
    // (and kept the previously rendered list on screen) when only the page param changed.
    useEffect(() => {
        setItems(undefined);
        setListStart(undefined);
        setErrorMessage('');
    }, [feedType]);

    useEffect(() => {
        let ignore = false;

        fetchFeed(feedType, pageNum).then(
            (feedItems) => {
                if (ignore) {
                    return;
                }
                setItems(feedItems);
                setListStart((pageNum - 1) * 30 + 1);
                window.scrollTo(0, 0);
            },
            () => {
                if (ignore) {
                    return;
                }
                setErrorMessage('Could not load ' + feedType + ' stories.');
            }
        );

        return () => {
            ignore = true;
        };
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
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <Item className="item-block" item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <NavLink
                                to={'/' + feedType + '/' + (pageNum - 1)}
                                className={({ isActive }) => (isActive ? 'prev active' : 'prev')}
                            >
                                ‹ Prev
                            </NavLink>
                        )}
                        {items.length === 30 && (
                            <NavLink
                                to={'/' + feedType + '/' + (pageNum + 1)}
                                className={({ isActive }) => (isActive ? 'more active' : 'more')}
                            >
                                More ›
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
