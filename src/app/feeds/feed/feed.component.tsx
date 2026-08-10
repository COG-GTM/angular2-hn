import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';
import Item from '../item/item.component';
import Loader from '../../shared/components/loader/loader.component';
import ErrorMessage from '../../shared/components/error-message/error-message.component';
import './feed.component.scss';

export default function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? +page : 1;
    const [feed, setFeed] = useState<{ items: Story[]; listStart: number } | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setErrorMessage('');

        fetchFeed(feedType, pageNum)
            .then(stories => {
                if (cancelled) {
                    return;
                }
                setFeed({ items: stories, listStart: (pageNum - 1) * 30 + 1 });
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
    }, [feedType, pageNum]);

    return (
        <div className="feed-page">
            <div className="main-content">
                {!feed && !errorMessage && <Loader />}
                {!feed && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

                {feed && (
                    <div>
                        {feedType === 'jobs' && (
                            <p className="job-header">
                                These are jobs at startups that were funded by Y Combinator. You can also get a job at a
                                YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                            </p>
                        )}
                        <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={feed.listStart}>
                            {feed.items.map(item => (
                                <li key={item.id} className="post">
                                    <Item item={item} />
                                </li>
                            ))}
                        </ol>
                        <div className="nav">
                            {feed.listStart !== 1 && (
                                <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                    ‹ Prev
                                </Link>
                            )}
                            {feed.items.length === 30 && (
                                <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                    More ›
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
