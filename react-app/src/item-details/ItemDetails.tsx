import { useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router';

import { ErrorMessage, Loader } from '../shared/components';
import { useItem, useSettings } from '../shared/hooks';
import type { Story } from '../shared/models';
import { formatCommentCount, hasExternalUrl, sanitizeHtml } from '../shared/utils';
import { Comment } from './Comment';
import './ItemDetails.scss';

function TitleLink({ item, openLinkInNewTab }: { item: Story; openLinkInNewTab: boolean }) {
    if (hasExternalUrl(item.url)) {
        return (
            <a
                className="title"
                href={item.url}
                target={openLinkInNewTab ? '_blank' : undefined}
                rel={openLinkInNewTab ? 'noopener' : undefined}
            >
                {item.title}
            </a>
        );
    }
    return (
        <NavLink className="title" to={`/item/${item.id}`}>
            {item.title}
        </NavLink>
    );
}

export function ItemDetails() {
    const { id } = useParams();
    const itemId = Number(id);
    const { data: item, isError } = useItem(itemId);
    const { settings } = useSettings();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemId]);

    return (
        <div className="main-content">
            {!item && !isError && <Loader />}
            {!item && isError && <ErrorMessage message="Could not load item comments." />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            <TitleLink item={item} openLinkInNewTab={settings.openLinkInNewTab} />
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
                        <p>
                            <TitleLink item={item} openLinkInNewTab={settings.openLinkInNewTab} />
                            {hasExternalUrl(item.url) && item.domain && (
                                <>
                                    {' '}
                                    <span className="domain">({item.domain})</span>
                                </>
                            )}
                        </p>
                        <div className="subtext">
                            {item.type !== 'job' && (
                                <span>
                                    {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                {item.time_ago}
                                {item.type !== 'job' && (
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
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {(item.poll ?? []).map((pollResult, i) => (
                                <div className="pollContent" key={i}>
                                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }}></div>
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}></p>
                    <ul className="comment-list">
                        {(item.comments ?? []).map((comment) => (
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
