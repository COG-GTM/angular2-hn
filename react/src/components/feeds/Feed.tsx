import { useEffect } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';

import { useFeed } from '../../api/hooks';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Loader } from '../shared/Loader';
import { Item } from './Item';
import './Feed.scss';

function activeClass(base: string) {
    return ({ isActive }: { isActive: boolean }) => (isActive ? `${base} active` : base);
}

export function Feed() {
    const { page } = useParams();
    const { pathname } = useLocation();
    const feedType = pathname.split('/')[1];
    const pageNum = page ? Number(page) : 1;
    const { data: items, loading, error } = useFeed(feedType, pageNum);
    const listStart = (pageNum - 1) * 30 + 1;

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    return (
        <div className="main-content">
            {loading && <Loader />}
            {!items && !loading && error && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

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
                            <NavLink className={activeClass('prev')} to={`/${feedType}/${pageNum - 1}`}>
                                ‹ Prev
                            </NavLink>
                        )}
                        {items.length === 30 && (
                            <NavLink className={activeClass('more')} to={`/${feedType}/${pageNum + 1}`}>
                                More ›
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
