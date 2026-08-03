import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../shared/api/hackernews-api';
import ErrorMessage from '../../shared/components/ErrorMessage';
import Loader from '../../shared/components/Loader';
import type { Story } from '../../shared/models/story';
import { useSettings } from '../../shared/settings/useSettings';
import { formatCommentCount } from '../../shared/utils/comment-count';
import CommentThread from './CommentThread';
import './ItemDetailsPage.scss';

export default function ItemDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const settings = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setItem(null);
        setErrorMessage('');
        window.scrollTo(0, 0);

        fetchItemContent(Number(id))
            .then((story) => {
                if (!cancelled) {
                    setItem(story);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage('Could not load item comments.');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (!item) {
        return (
            <div className="main-content item-details-page">
                {!errorMessage && <Loader />}
                {errorMessage !== '' && <ErrorMessage message={errorMessage} />}
            </div>
        );
    }

    const hasUrl = item.url?.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
    const titleLink = hasUrl ? (
        <a className="title" href={item.url} {...externalLinkProps}>
            {item.title}
        </a>
    ) : (
        <Link className="title" to={`/item/${item.id}`}>
            {item.title}
        </Link>
    );
    const laptopClassNames = ['laptop'];
    if (item.comments_count > 0 || isJob) {
        laptopClassNames.push('item-header');
    }
    if (item.text) {
        laptopClassNames.push('head-margin');
    }

    return (
        <div className="main-content item-details-page">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span
                            className="back-button"
                            role="button"
                            aria-label="Go back"
                            onClick={() => navigate(-1)}
                        ></span>
                        {titleLink}
                    </p>
                </div>
                <div className={laptopClassNames.join(' ')}>
                    <p>
                        {titleLink}
                        {hasUrl && item.domain && <span className="domain">({item.domain})</span>}
                    </p>
                    <div className="subtext">
                        {!isJob && (
                            <span>
                                {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                            </span>
                        )}
                        <span className={isJob ? undefined : 'item-details'}>
                            {item.time_ago}
                            {!isJob && (
                                <span>
                                    {' | '}
                                    <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {item.poll.map((pollResult, index) => (
                            <div key={index} className="pollContent">
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
                <ul className="comment-list">
                    {item.comments?.map((comment) => (
                        <li key={comment.id}>
                            <CommentThread comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
