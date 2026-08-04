import { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';

import Item from '../item/Item';
import ErrorMessage from '../../shared/components/error-message/ErrorMessage';
import Loader from '../../shared/components/loader/Loader';
import { Story } from '../../shared/models';
import { fetchFeed, isAbortError } from '../../shared/services/hackernews-api';

import './Feed.scss';

interface FeedProps {
    feedType: 'news' | 'newest' | 'show' | 'ask' | 'jobs';
}

interface FeedState {
    feedType: string;
    pageNum: number;
    items: Story[] | null;
    errorMessage: string;
    listStart: number;
}

function activeClassName(baseClassName: string) {
    return ({ isActive }: { isActive: boolean }) => (isActive ? `${baseClassName} active` : baseClassName);
}

export default function Feed({ feedType }: FeedProps) {
    const { page } = useParams();
    const pageNum = page ? Number(page) : 1;
    const [state, setState] = useState<FeedState | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        fetchFeed(feedType, pageNum, controller.signal)
            .then((items) => {
                setState({ feedType, pageNum, items, errorMessage: '', listStart: (pageNum - 1) * 30 + 1 });
                window.scrollTo(0, 0);
            })
            .catch((error: unknown) => {
                if (!isAbortError(error)) {
                    setState({
                        feedType,
                        pageNum,
                        items: null,
                        errorMessage: 'Could not load ' + feedType + ' stories.',
                        listStart: 1,
                    });
                }
            });

        return () => controller.abort();
    }, [feedType, pageNum]);

    const loaded = state && state.feedType === feedType && state.pageNum === pageNum ? state : null;
    const items = loaded?.items ?? null;
    const errorMessage = loaded?.errorMessage ?? '';
    const listStart = loaded?.listStart;

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
                            <NavLink className={activeClassName('prev')} to={`/${feedType}/${pageNum - 1}`}>
                                ‹ Prev
                            </NavLink>
                        )}
                        {items.length === 30 && (
                            <NavLink className={activeClassName('more')} to={`/${feedType}/${pageNum + 1}`}>
                                More ›
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
