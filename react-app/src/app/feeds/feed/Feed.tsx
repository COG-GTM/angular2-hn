import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Story } from '../../shared/models/models';
import { fetchFeed } from '../../shared/services/hackernews-api';
import { Loader } from '../../shared/components/loader/Loader';
import { ErrorMessage } from '../../shared/components/error-message/ErrorMessage';
import { Item } from '../item/Item';
import './feed.scss';

export function Feed({ feedType }: { feedType: string }): JSX.Element {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? Number(page) : 1;
    const [items, setItems] = useState<Story[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const listStart = (pageNum - 1) * 30 + 1;

    useEffect(() => {
        const controller = new AbortController();
        setItems(null);
        setErrorMessage('');
        fetchFeed(feedType, pageNum, controller.signal)
            .then((stories) => {
                setItems(stories);
                window.scrollTo(0, 0);
            })
            .catch((error: unknown) => {
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    setErrorMessage(`Could not load ${feedType} stories.`);
                }
            });
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
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <item className="item-block">
                                        <Item item={item} />
                                    </item>
                                </li>
                            ))}
                        </ol>
                        <div className="nav">
                            {listStart !== 1 && (
                                <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                    {' '}
                                    ‹ Prev{' '}
                                </Link>
                            )}
                            {items.length === 30 && (
                                <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                    {' '}
                                    More ›{' '}
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </app-feed>
    );
}
