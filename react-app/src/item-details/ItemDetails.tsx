import { useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';

import { useItem } from '../api/queries';
import { BackButton } from '../components/BackButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import type { Story } from '../models';
import { useSettings } from '../settings/SettingsContext';
import { externalLinkProps, formatCommentCount, hasExternalUrl, sanitizeHtml } from '../utils/format';
import { Comment } from './Comment';
import './ItemDetails.scss';

function Title({ item, openInNewTab }: { item: Story; openInNewTab: boolean }) {
    return hasExternalUrl(item.url) ? (
        <a className="title" href={item.url} {...externalLinkProps(openInNewTab)}>
            {item.title}
        </a>
    ) : (
        <NavLink className="title" to={`/item/${item.id}`}>
            {item.title}
        </NavLink>
    );
}

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const itemId = Number(id);
    const { data: item, isError } = useItem(itemId);
    const { settings } = useSettings();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemId]);

    const isJob = item?.type === 'job';

    return (
        <div className="app-item-details">
            <div className="main-content">
                {!item && !isError && <Loader />}
                {!item && isError && <ErrorMessage message="Could not load item comments." />}

                {item && (
                    <div className="item">
                        <div className="mobile item-header">
                            <p className="title-block">
                                <BackButton />
                                <Title item={item} openInNewTab={settings.openLinkInNewTab} />
                            </p>
                        </div>
                        <div className={item.comments_count > 0 || isJob ? 'laptop item-header' : 'laptop'}>
                            <p>
                                <Title item={item} openInNewTab={settings.openLinkInNewTab} />{' '}
                                {hasExternalUrl(item.url) && item.domain && (
                                    <span className="domain">({item.domain})</span>
                                )}
                            </p>
                            <div className="subtext">
                                {!isJob && (
                                    <span>
                                        {item.points} points by{' '}
                                        <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>{' '}
                                    </span>
                                )}
                                <span className={isJob ? undefined : 'item-details'}>
                                    {item.time_ago}
                                    {!isJob && (
                                        <span>
                                            {' | '}
                                            <NavLink to={`/item/${item.id}`}>
                                                {formatCommentCount(item.comments_count)}
                                            </NavLink>
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                        {item.type === 'poll' && item.poll && (
                            <div className="pollResults">
                                {item.poll.map((pollResult, i) => (
                                    <div key={i} className="pollContent">
                                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }} />
                                        <div className="subtext">{pollResult.points} points</div>
                                        <div
                                            className="pollBar"
                                            style={{
                                                width: `${(pollResult.points / (item.poll_votes_count || 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />
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
        </div>
    );
}
