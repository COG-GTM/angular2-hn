import type { KeyboardEvent } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router';

import { useItem } from '../../shared/api';
import { ErrorMessage, Loader } from '../../shared/components';
import type { Story } from '../../shared/models';
import { useSettings } from '../../shared/settings';
import { commentLabel, sanitizeHtml, useScrollToTop } from '../../shared/utils';
import { Comment } from './Comment';
import './ItemDetails.scss';

const ITEM_ERROR_MESSAGE = 'Could not load item comments.';

/** Angular `hasUrl`: external stories have an absolute `http(s)` url; Ask/text posts have `item?id=…`. */
function hasUrl(item: Story): boolean {
    return typeof item.url === 'string' && item.url.indexOf('http') === 0;
}

/** Poll bar width in % — `poll_votes_count` may be 0 (Angular divided by it unguarded). */
function pollBarWidth(points: number, total: number | undefined): string {
    return total && total > 0 ? `${(points / total) * 100}%` : '0%';
}

/** Port of Angular `app-item-details` (`/item/:id`). */
export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    useScrollToTop(id);
    const { data: item, isError } = useItem(id);

    return (
        <div className="main-content item-details" data-testid="item-details">
            {item ? <ItemView item={item} /> : isError ? <ErrorMessage message={ITEM_ERROR_MESSAGE} /> : <Loader />}
        </div>
    );
}

function ItemView({ item }: { item: Story }) {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const external = hasUrl(item);
    const newTab = settings.openLinkInNewTab
        ? ({ target: '_blank', rel: 'noopener noreferrer' } as const)
        : ({} as const);
    const goBack = () => navigate(-1);
    const onBackKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goBack();
        }
    };
    const titleLink = external ? (
        <a className="title" href={item.url} {...newTab}>
            {item.title}
        </a>
    ) : (
        <NavLink className="title" to={`/item/${item.id}`}>
            {item.title}
        </NavLink>
    );
    const isJob = item.type === 'job';

    return (
        <div className="item">
            <div className="mobile item-header">
                <p className="title-block">
                    <span
                        className="back-button"
                        role="button"
                        tabIndex={0}
                        aria-label="Back"
                        onClick={goBack}
                        onKeyDown={onBackKeyDown}
                    ></span>{' '}
                    {titleLink}
                </p>
            </div>
            <div className={item.comments_count > 0 || isJob ? 'laptop item-header' : 'laptop'}>
                <p>
                    {titleLink}
                    {external && item.domain ? (
                        <>
                            {' '}
                            <span className="domain">({item.domain})</span>
                        </>
                    ) : null}
                </p>
                <div className="subtext">
                    {!isJob ? (
                        <>
                            <span>
                                {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                            </span>{' '}
                        </>
                    ) : null}
                    <span className={isJob ? undefined : 'item-details'}>
                        {item.time_ago}
                        {!isJob ? (
                            <>
                                {' '}
                                <span>
                                    {'| '}
                                    <NavLink to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</NavLink>
                                </span>
                            </>
                        ) : null}
                    </span>
                </div>
            </div>
            {item.type === 'poll' ? (
                <div className="pollResults">
                    {(item.poll ?? []).map((pollResult, index) => (
                        <div key={index} className="pollContent">
                            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }} />
                            <div className="subtext">{pollResult.points} points</div>
                            <div
                                className="pollBar"
                                style={{ width: pollBarWidth(pollResult.points, item.poll_votes_count) }}
                            ></div>
                        </div>
                    ))}
                </div>
            ) : null}
            <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />
            <ul className="comment-list">
                {(item.comments ?? []).map((comment) => (
                    <li key={comment.id}>
                        <Comment comment={comment} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
