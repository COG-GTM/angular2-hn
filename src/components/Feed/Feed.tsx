import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { FeedName, Story } from '../../models';
import { fetchFeed } from '../../services/hackerNewsApi';
import { classNames } from '../../utils/classNames';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { Item } from '../Item/Item';
import { Loader } from '../Loader/Loader';
import { RouterLink } from '../RouterLink';
import './Feed.scss';

const PAGE_SIZE = 30;

export function Feed({ feedType }: { feedType: FeedName }) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? +page : 1;
    const [items, setItems] = useState<Story[]>();
    const [listStart, setListStart] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        fetchFeed(feedType, pageNum).then(
            (stories) => {
                if (cancelled) return;
                setItems(stories);
                setListStart((pageNum - 1) * PAGE_SIZE + 1);
                window.scrollTo(0, 0);
            },
            () => {
                if (!cancelled) setErrorMessage('Could not load ' + feedType + ' stories.');
            }
        );
        return () => {
            cancelled = true;
        };
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
                                {' These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through '}
                                <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>
                                {'. '}
                            </p>
                        )}
                        <ol className={classNames(feedType !== 'jobs' && 'list-margin')} start={listStart}>
                            {items.map((item) => (
                                <li key={item.id} className="post">
                                    <Item item={item} />
                                </li>
                            ))}
                        </ol>
                        <div className="nav">
                            {listStart !== 1 && (
                                <RouterLink to={`/${feedType}/${pageNum - 1}`} className="prev">
                                    {' ‹ Prev '}
                                </RouterLink>
                            )}
                            {items.length === PAGE_SIZE && (
                                <RouterLink to={`/${feedType}/${pageNum + 1}`} className="more">
                                    {' More › '}
                                </RouterLink>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </app-feed>
    );
}
