import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../api/hackernews-api';
import type { Story } from '../models';
import { useSettings } from '../settings';
import { ErrorMessage, Loader } from '../shared/components';
import { formatCommentCount } from '../utils/comment-format';
import { Comment } from './Comment';

import './item-details.scss';

const ERROR_MESSAGE = 'Could not load item comments.';

type Item = Story & { content?: string; text?: string };

interface LoadResult {
    id: string | undefined;
    item: Item | null;
    errorMessage: string;
}

export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [result, setResult] = useState<LoadResult>({ id: undefined, item: null, errorMessage: '' });

    useEffect(() => {
        const controller = new AbortController();
        fetchItemContent(Number(id), controller.signal)
            .then((story) => {
                if (!controller.signal.aborted) {
                    setResult({ id, item: story, errorMessage: '' });
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setResult({ id, item: null, errorMessage: ERROR_MESSAGE });
                }
            });
        window.scrollTo(0, 0);
        return () => controller.abort();
    }, [id]);

    const { item, errorMessage } = result.id === id ? result : { item: null, errorMessage: '' };

    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

    return (
        <div className="main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {hasUrl(item) ? (
                                <a className="title" href={item.url} target={target} rel={rel}>
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
                                <a className="title" href={item.url} target={target} rel={rel}>
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
                                    {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' '}
                                        | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
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
                        {item.comments.map((comment) => (
                            <li key={comment.id}>
                                <Comment comment={comment} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function hasUrl(item: Item): boolean {
    return item.url.indexOf('http') === 0;
}
