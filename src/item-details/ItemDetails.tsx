import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

import CommentItem from './comment/Comment';
import ErrorMessage from '../shared/components/error-message/ErrorMessage';
import Loader from '../shared/components/loader/Loader';
import { Story } from '../shared/models';
import { formatCommentCount } from '../shared/helpers/comment-count';
import { fetchItemContent, isAbortError } from '../shared/services/hackernews-api';
import { useSettings } from '../shared/services/settings-context';

import './ItemDetails.scss';

interface ItemDetailsState {
    id: string;
    item: Story | null;
    errorMessage: string;
}

function activeClassName(baseClassName?: string) {
    return ({ isActive }: { isActive: boolean }) =>
        [baseClassName, isActive ? 'active' : undefined].filter(Boolean).join(' ') || undefined;
}

export default function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { openLinkInNewTab } = useSettings();
    const [state, setState] = useState<ItemDetailsState | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!id) {
            return;
        }

        const controller = new AbortController();
        const itemID = Number(id);

        fetchItemContent(itemID, controller.signal)
            .then((item) => setState({ id, item, errorMessage: '' }))
            .catch((error: unknown) => {
                if (!isAbortError(error)) {
                    setState({ id, item: null, errorMessage: 'Could not load item comments.' });
                }
            });

        return () => controller.abort();
    }, [id]);

    const loaded = state && state.id === id ? state : null;
    const item = loaded?.item ?? null;
    const errorMessage = loaded?.errorMessage ?? '';

    const goBack = () => navigate(-1);

    if (!item) {
        return (
            <div className="main-content item-details-view">
                {!errorMessage && <Loader />}
                {errorMessage !== '' && <ErrorMessage message={errorMessage} />}
            </div>
        );
    }

    const hasUrl = item.url?.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const laptopClassName = [
        'laptop',
        (item.comments_count ?? 0) > 0 || isJob ? 'item-header' : undefined,
        item.text ? 'head-margin' : undefined,
    ]
        .filter(Boolean)
        .join(' ');
    const pollVotesCount = item.poll_votes_count ?? 0;

    return (
        <div className="main-content item-details-view">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span className="back-button" onClick={goBack}></span>
                        {hasUrl ? (
                            <a
                                className="title"
                                href={item.url}
                                target={openLinkInNewTab ? '_blank' : undefined}
                                rel={openLinkInNewTab ? 'noopener' : undefined}
                            >
                                {item.title}
                            </a>
                        ) : (
                            <NavLink className={activeClassName('title')} to={`/item/${item.id}`}>
                                {item.title}
                            </NavLink>
                        )}
                    </p>
                </div>
                <div className={laptopClassName}>
                    {hasUrl ? (
                        <p>
                            <a
                                className="title"
                                href={item.url}
                                target={openLinkInNewTab ? '_blank' : undefined}
                                rel={openLinkInNewTab ? 'noopener' : undefined}
                            >
                                {item.title}
                            </a>
                            {item.domain && <span className="domain">({item.domain})</span>}
                        </p>
                    ) : (
                        <p>
                            <NavLink className={activeClassName('title')} to={`/item/${item.id}`}>
                                {item.title}
                            </NavLink>
                        </p>
                    )}
                    <div className="subtext">
                        {!isJob && (
                            <span>
                                {item.points} points by{' '}
                                <NavLink className={activeClassName()} to={`/user/${item.user}`}>
                                    {item.user}
                                </NavLink>
                            </span>
                        )}
                        <span className={isJob ? undefined : 'item-details'}>
                            {item.time_ago}
                            {!isJob && (
                                <span>
                                    {' '}
                                    |{' '}
                                    <NavLink className={activeClassName()} to={`/item/${item.id}`}>
                                        {formatCommentCount(item.comments_count)}
                                    </NavLink>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {item.poll?.map((pollResult, index) => (
                            <div key={index} className="pollContent">
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{
                                        width: pollVotesCount ? `${(pollResult.points / pollVotesCount) * 100}%` : '0%',
                                    }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
                <ul className="comment-list">
                    {item.comments?.map((comment) => (
                        <li key={comment.id}>
                            <CommentItem comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
