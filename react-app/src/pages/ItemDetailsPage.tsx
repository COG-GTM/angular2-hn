import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { CommentView } from '../components/CommentView';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useSettings } from '../hooks/useSettings';
import { fetchItemContent } from '../services/hackernews-api';
import type { Story } from '../types';
import { commentCount } from '../utils/comment';
import { hasUrl } from '../utils/story';
import './ItemDetailsPage.scss';

export function ItemDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItem(null);
        setErrorMessage('');
        window.scrollTo(0, 0);

        fetchItemContent(Number(id), controller.signal)
            .then(setItem)
            .catch((error: unknown) => {
                if (!controller.signal.aborted) {
                    console.error(error);
                    setErrorMessage('Could not load item comments.');
                }
            });

        return () => controller.abort();
    }, [id]);

    const externalLinkProps = settings.openLinkInNewTab
        ? { target: '_blank', rel: 'noopener' }
        : {};

    return (
        <div className="main-content item-details">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {hasUrl(item) ? (
                                <a className="title" href={item.url} {...externalLinkProps}>
                                    {item.title}
                                </a>
                            ) : (
                                <Link className="title" to={`/item/${item.id}`}>
                                    {item.title}
                                </Link>
                            )}
                        </p>
                    </div>
                    <div
                        className={[
                            'laptop',
                            item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
                            item.text ? 'head-margin' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {hasUrl(item) ? (
                            <p>
                                <a className="title" href={item.url} {...externalLinkProps}>
                                    {item.title}
                                </a>
                                {item.domain && <span className="domain">({item.domain})</span>}
                            </p>
                        ) : (
                            <p>
                                <Link className="title" to={`/item/${item.id}`}>
                                    {item.title}
                                </Link>
                            </p>
                        )}
                        <div className="subtext">
                            {item.type !== 'job' && (
                                <span>
                                    {item.points} points by{' '}
                                    <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details-meta' : undefined}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' | '}
                                        <Link to={`/item/${item.id}`}>
                                            {commentCount(item.comments_count)}
                                        </Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll.map((pollResult, index) => (
                                <div className="pollContent" key={index}>
                                    <div
                                        dangerouslySetInnerHTML={{ __html: pollResult.content }}
                                    ></div>
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{
                                            width: `${
                                                (pollResult.points / item.poll_votes_count) * 100
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p
                        className="subject"
                        dangerouslySetInnerHTML={{ __html: item.content ?? '' }}
                    ></p>
                    <ul className="comment-list">
                        {(item.comments ?? []).map((comment) => (
                            <li key={comment.id}>
                                <CommentView comment={comment} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
