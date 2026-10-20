import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useItem } from '../shared/api/hooks';
import { ErrorMessage } from '../shared/components/ErrorMessage';
import { Loader } from '../shared/components/Loader';
import type { Story } from '../shared/models';
import { useSettingsStore } from '../shared/store/settings';
import { formatCommentCount } from '../shared/utils/comment';
import { Comment } from './Comment';
import './ItemDetails.scss';

const ERROR_MESSAGE = 'Could not load item comments.';

/** Port of `ItemDetailsComponent.hasUrl`. */
function hasExternalUrl(item: Story): boolean {
    return typeof item.url === 'string' && item.url.indexOf('http') === 0;
}

/** Angular: `[ngStyle]="{'width': pollResult.points/item.poll_votes_count*100+'%'}"`. */
function pollBarWidth(points: number | undefined, votesCount: number | undefined): string | undefined {
    if (points == null || !votesCount) {
        return undefined;
    }
    return `${(points / votesCount) * 100}%`;
}

interface TitleLinkProps {
    item: Story;
    openLinkInNewTab: boolean;
}

function TitleLink({ item, openLinkInNewTab }: TitleLinkProps) {
    if (hasExternalUrl(item)) {
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
        <Link className="title" to={`/item/${item.id}`}>
            {item.title}
        </Link>
    );
}

/**
 * Port of `ItemDetailsComponent` (`/item/:id`): story header (mobile + laptop variants),
 * poll results, text content and the recursive comment tree.
 */
export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const itemId = Number(id);
    const navigate = useNavigate();
    const openLinkInNewTab = useSettingsStore((state) => state.openLinkInNewTab);
    const { data: item, isError } = useItem(itemId);

    useEffect(() => {
        if (item) {
            window.scrollTo(0, 0);
        }
    }, [item]);

    return (
        <div className="app-item-details">
            <div className="main-content">
                {!item && !isError && <Loader />}
                {!item && isError && <ErrorMessage message={ERROR_MESSAGE} />}

                {item && (
                    <div className="item">
                        <div className="mobile item-header">
                            <p className="title-block">
                                <span className="back-button" onClick={() => navigate(-1)}></span>
                                <TitleLink item={item} openLinkInNewTab={openLinkInNewTab} />
                            </p>
                        </div>
                        <div
                            className={[
                                'laptop',
                                item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <p>
                                <TitleLink item={item} openLinkInNewTab={openLinkInNewTab} />
                                {hasExternalUrl(item) && item.domain && (
                                    <>
                                        {' '}
                                        <span className="domain">({item.domain})</span>
                                    </>
                                )}
                            </p>
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
                                {(item.poll ?? []).map((pollResult, index) => (
                                    <div key={index} className="pollContent">
                                        <div dangerouslySetInnerHTML={{ __html: pollResult.content ?? '' }}></div>
                                        <div className="subtext">{pollResult.points ?? '?'} points</div>
                                        <div
                                            className="pollBar"
                                            style={{ width: pollBarWidth(pollResult.points, item.poll_votes_count) }}
                                        ></div>
                                    </div>
                                ))}
                                {item.poll_incomplete && (
                                    <p className="subtext poll-incomplete">Some poll options could not be loaded.</p>
                                )}
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
        </div>
    );
}
