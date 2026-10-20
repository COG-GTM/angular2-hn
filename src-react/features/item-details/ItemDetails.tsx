import type { KeyboardEvent } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

import { useItem } from '../../shared/api';
import { ErrorMessage, Loader } from '../../shared/components';
import type { Story } from '../../shared/models';
import { useSettings } from '../../shared/settings';
import { commentLabel, sanitizeHtml, useScrollToTop } from '../../shared/utils';
import { Comment } from './Comment';
import './ItemDetails.scss';

const ERROR_MESSAGE = 'Could not load item comments.';

/** Keeps the Phase 1 `routes.test.tsx` contract (`item-id` test id) until Phase 3 rewrites that test. */
function RouteProbe({ id }: { id: string | undefined }) {
    return (
        <span hidden data-testid="item-id">
            {id}
        </span>
    );
}

function hasUrl(item: Story): boolean {
    return typeof item.url === 'string' && item.url.indexOf('http') === 0;
}

function TitleLink({ item, openLinkInNewTab }: { item: Story; openLinkInNewTab: boolean }) {
    if (hasUrl(item)) {
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

function pollBarWidth(points: number, total: number | undefined): string {
    return total ? `${(points / total) * 100}%` : '0%';
}

/** Port of `ItemDetailsComponent` (route `/item/:id`). */
export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const { data: item, isError } = useItem(id);
    const { settings } = useSettings();
    const navigate = useNavigate();
    useScrollToTop(id);

    const goBack = () => navigate(-1);
    const onBackKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goBack();
        }
    };

    if (!item) {
        return (
            <div className="main-content item-details-page">
                <RouteProbe id={id} />
                {isError ? <ErrorMessage message={ERROR_MESSAGE} /> : <Loader />}
            </div>
        );
    }

    const isJob = item.type === 'job';
    // Angular also toggled `head-margin` on `item.text`, a field the API never sends, so it is never applied.
    const laptopClass = item.comments_count > 0 || isJob ? 'laptop item-header' : 'laptop';

    return (
        <div className="main-content item-details-page">
            <RouteProbe id={id} />
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span
                            className="back-button"
                            role="button"
                            tabIndex={0}
                            aria-label="Go back"
                            onClick={goBack}
                            onKeyDown={onBackKeyDown}
                        ></span>
                        <TitleLink item={item} openLinkInNewTab={settings.openLinkInNewTab} />
                    </p>
                </div>
                <div className={laptopClass}>
                    <p>
                        <TitleLink item={item} openLinkInNewTab={settings.openLinkInNewTab} />
                        {hasUrl(item) && item.domain && (
                            <>
                                {' '}
                                <span className="domain">({item.domain})</span>
                            </>
                        )}
                    </p>
                    <div className="subtext">
                        {!isJob && (
                            <span>
                                {item.points} points by{' '}
                                <NavLink to={`/user/${encodeURIComponent(item.user ?? '')}`}>{item.user}</NavLink>
                            </span>
                        )}
                        <span className={isJob ? undefined : 'item-details'}>
                            {` ${item.time_ago} `}
                            {!isJob && (
                                <span>
                                    {' | '}
                                    <NavLink to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</NavLink>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {(item.poll ?? []).filter(Boolean).map((pollResult, index) => (
                            <div className="pollContent" key={index}>
                                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }}></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    data-testid="poll-bar"
                                    style={{ width: pollBarWidth(pollResult.points, item.poll_votes_count) }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}></p>
                <ul className="comment-list">
                    {(item.comments ?? []).map((comment, index) => (
                        <li key={comment.id ?? `i${index}`}>
                            <Comment comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
