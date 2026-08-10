import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeed } from '../shared/api/hackernews';
import { ErrorMessage } from '../shared/components/ErrorMessage';
import { Loader } from '../shared/components/Loader';
import type { Story } from '../shared/models';
import { Item } from './Item';
import './Feed.scss';

export function Feed({ feedType, pageNum }: { feedType: string; pageNum: number }) {
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const listStart = (pageNum - 1) * 30 + 1;

    useEffect(() => {
        const controller = new AbortController();

        fetchFeed(feedType, pageNum, controller.signal)
            .then((stories) => {
                setItems(stories);
                window.scrollTo(0, 0);
            })
            .catch((error: unknown) => {
                if (!controller.signal.aborted) {
                    console.error(error);
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
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
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <div className="item-block">
                                    <Item item={item} />
                                </div>
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
