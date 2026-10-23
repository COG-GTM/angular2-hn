import type { KeyboardEvent } from 'react';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../api';
import { ErrorMessage, Loader } from '../../components';
import { useSettings } from '../../context/SettingsContext';
import { useFetch } from '../../hooks/useFetch';
import type { Story } from '../../types';
import { externalHref, formatCommentCount, sanitizeHtml, useScrollToTop } from '../../utils';
import { Comment } from './Comment';
import { pollBarWidth } from './pollBarWidth';
import './ItemDetailsPage.scss';

export const ITEM_ERROR_MESSAGE = 'Could not load item comments.';

function TitleLink({ item }: { item: Story }) {
    const { settings } = useSettings();
    const href = externalHref(item.url);
    if (href === null) {
        return (
            <NavLink className="title" to={`/item/${item.id}`}>
                {item.title}{' '}
            </NavLink>
        );
    }
    return (
        <a
            className="title"
            href={href}
            target={settings.openLinkInNewTab ? '_blank' : undefined}
            rel={settings.openLinkInNewTab ? 'noopener' : undefined}
        >
            {item.title}{' '}
        </a>
    );
}

/** Port of src/app/item-details. Rendered (lazily) at `/item/:id`. */
export function ItemDetailsPage() {
    const { id = '' } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    useScrollToTop(id);
    const state = useFetch((signal) => fetchItemContent(id, signal), `${id}|${location.key}`);

    const goBack = () => navigate(-1);
    const onBackKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goBack();
        }
    };

    if (state.status === 'loading') {
        return (
            <div className="main-content item-page">
                <Loader />
            </div>
        );
    }
    if (state.status === 'error') {
        return (
            <div className="main-content item-page">
                <ErrorMessage message={ITEM_ERROR_MESSAGE} />
            </div>
        );
    }

    const item = state.data;
    const isJob = item.type === 'job';
    const hasUrl = externalHref(item.url) !== null;
    const laptopClass = item.comments_count > 0 || isJob ? 'laptop item-header' : 'laptop';

    return (
        <div className="main-content item-page">
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
                        <TitleLink item={item} />
                    </p>
                </div>
                <div className={laptopClass}>
                    <p>
                        <TitleLink item={item} />
                        {hasUrl && item.domain && <span className="domain">({item.domain})</span>}
                    </p>
                    <div className="subtext">
                        {!isJob && (
                            <span>
                                {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                            </span>
                        )}
                        <span className={isJob ? undefined : 'item-details'}>
                            {' '}
                            {item.time_ago}{' '}
                            {!isJob && (
                                <span>
                                    {' '}
                                    |{' '}
                                    <NavLink to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</NavLink>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {(item.poll ?? []).map((pollResult, index) => (
                            <div key={index} className="pollContent">
                                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }} />
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
                <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />
                <ul className="comment-list">
                    {(item.comments ?? []).map((comment) => (
                        <li key={comment.id}>
                            <Comment comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
