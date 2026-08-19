import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage';
import Loader from '../../components/Loader';
import type { Story } from '../../models';
import { fetchFeed } from '../../services/hackernews-api';
import Item from './Item';

export default function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;
    const [items, setItems] = useState<Story[]>();
    const [listStart, setListStart] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        fetchFeed(feedType, pageNum, controller.signal).then(
            stories => {
                if (controller.signal.aborted) {
                    return;
                }
                setItems(stories);
                setListStart((pageNum - 1) * 30 + 1);
                window.scrollTo(0, 0);
            },
            () => {
                if (!controller.signal.aborted) {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            }
        );

        return () => controller.abort();
    }, [feedType, pageNum]);

    return (
        <app-feed>
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
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                            {items.map(item => (
                                <li key={item.id} className="post">
                                    <Item item={item} />
                                </li>
                            ))}
                        </ol>
                        <div className="nav">
                            {listStart !== 1 && (
                                <NavLink className="prev" to={`/${feedType}/${pageNum - 1}`}>
                                    ‹ Prev
                                </NavLink>
                            )}
                            {items.length === 30 && (
                                <NavLink className="more" to={`/${feedType}/${pageNum + 1}`}>
                                    More ›
                                </NavLink>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </app-feed>
    );
}
