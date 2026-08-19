import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../../api/hackernews';
import '../../app/feeds/feed/feed.component.scss';
import { Story } from '../models/story';
import { content, host } from '../scope';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Loader } from '../shared/Loader';
import { Item } from './Item';

const c = content('feed');

export function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;

    const [items, setItems] = useState<Story[] | undefined>(undefined);
    const [listStart, setListStart] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;

        fetchFeed(feedType, pageNum).then(
            loaded => {
                if (cancelled) {
                    return;
                }
                setItems(loaded);
                setListStart((pageNum - 1) * 30 + 1);
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

    return (
        <div className="main-content" {...c}>
            {!items && errorMessage === '' && (
                <app-loader {...c} {...host('loader')}>
                    <Loader />
                </app-loader>
            )}
            {!items && errorMessage !== '' && (
                <app-error-message {...c} {...host('error-message')}>
                    <ErrorMessage message={errorMessage} />
                </app-error-message>
            )}

            {items && (
                <div {...c}>
                    {feedType === 'jobs' && (
                        <p className="job-header" {...c}>
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through{' '}
                            <a href="https://triplebyte.com/?ref=yc_jobs" {...c}>
                                Triplebyte
                            </a>
                            .
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart} {...c}>
                        {items.map(item => (
                            <li key={item.id} className="post" {...c}>
                                <item className="item-block" {...c} {...host('item')}>
                                    <Item item={item} />
                                </item>
                            </li>
                        ))}
                    </ol>
                    <div className="nav" {...c}>
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev" {...c}>
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
                            <Link to={`/${feedType}/${pageNum + 1}`} className="more" {...c}>
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
