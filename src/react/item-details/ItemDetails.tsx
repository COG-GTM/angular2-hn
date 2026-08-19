import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../api/hackernews';
import '../../app/item-details/item-details.component.scss';
import { Story } from '../models/story';
import { content, host } from '../scope';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Loader } from '../shared/Loader';
import { sanitizeHtml } from '../shared/sanitize';
import { comment as commentCount } from '../shared/comment';
import { useSettings } from '../settings/SettingsContext';
import { Comment } from './Comment';

const c = content('item-details');

type ItemContent = Story & { text?: string; content?: string };

export function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();

    const [item, setItem] = useState<ItemContent | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    const text = useMemo(() => sanitizeHtml(item?.content ?? ''), [item?.content]);

    useEffect(() => {
        let cancelled = false;

        fetchItemContent(Number(id)).then(
            loaded => {
                if (!cancelled) {
                    setItem(loaded);
                }
            },
            () => {
                if (!cancelled) {
                    setErrorMessage('Could not load item comments.');
                }
            }
        );

        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const hasUrl = item ? item.url.indexOf('http') === 0 : false;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

    return (
        <div className="main-content" {...c}>
            {!item && errorMessage === '' && (
                <app-loader {...c} {...host('loader')}>
                    <Loader />
                </app-loader>
            )}
            {!item && errorMessage !== '' && (
                <app-error-message {...c} {...host('error-message')}>
                    <ErrorMessage message={errorMessage} />
                </app-error-message>
            )}

            {item && (
                <div className="item" {...c}>
                    <div className="mobile item-header" {...c}>
                        <p className="title-block" {...c}>
                            <span className="back-button" onClick={() => navigate(-1)} {...c}></span>
                            {hasUrl ? (
                                <a className="title" href={item.url} target={target} rel={rel} {...c}>
                                    {item.title}
                                </a>
                            ) : (
                                <Link className="title" to={`/item/${item.id}`} {...c}>
                                    {item.title}
                                </Link>
                            )}
                        </p>
                    </div>
                    <div
                        className={[
                            'laptop',
                            item.comments_count > 0 || item.type === 'job' ? 'item-header' : null,
                            item.text ? 'head-margin' : null,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        {...c}
                    >
                        {hasUrl ? (
                            <p {...c}>
                                <a className="title" href={item.url} target={target} rel={rel} {...c}>
                                    {item.title}
                                </a>{' '}
                                {item.domain && (
                                    <span className="domain" {...c}>
                                        ({item.domain})
                                    </span>
                                )}
                            </p>
                        ) : (
                            <p {...c}>
                                <Link className="title" to={`/item/${item.id}`} {...c}>
                                    {item.title}
                                </Link>
                            </p>
                        )}
                        <div className="subtext" {...c}>
                            {item.type !== 'job' && (
                                <span {...c}>
                                    {item.points} points by{' '}
                                    <Link to={`/user/${item.user}`} {...c}>
                                        {item.user}
                                    </Link>
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details' : undefined} {...c}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span {...c}>
                                        {' '}
                                        |{' '}
                                        <Link to={`/item/${item.id}`} {...c}>
                                            {commentCount(item.comments_count)}
                                        </Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults" {...c}>
                            {item.poll.map((pollResult, index) => (
                                <div key={index} className="pollContent" {...c}>
                                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }} {...c}></div>
                                    <div className="subtext" {...c}>
                                        {pollResult.points} points
                                    </div>
                                    <div
                                        className="pollBar"
                                        style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                        {...c}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={{ __html: text }} {...c}></p>
                    <ul className="comment-list" {...c}>
                        {(item.comments ?? []).map(itemComment => (
                            <li key={itemComment.id} {...c}>
                                <app-comment {...c} {...host('comment')}>
                                    <Comment comment={itemComment} />
                                </app-comment>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
