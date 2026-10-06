import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import type { Story } from '../shared/models';
import type { Settings } from '../shared/models';
import { fetchItemContent } from '../shared/services/hackernewsApi';
import { useSettings } from '../shared/services/useSettings';
import { formatCommentCount } from '../shared/utils/comment';
import { onActivateKey } from '../shared/utils/a11y';
import { Loader } from '../shared/components/Loader/Loader';
import { ErrorMessage } from '../shared/components/ErrorMessage/ErrorMessage';
import { SafeHtml } from '../shared/components/SafeHtml/SafeHtml';
import { Comment } from './Comment';
import './ItemDetails.scss';

/** Angular's template also reads `item.text` (not part of the shared Story model). */
type ItemDetailsStory = Story & { text?: string };

interface ItemState {
    id: string | undefined;
    item?: ItemDetailsStory;
    error?: string;
}

const ERROR_MESSAGE = 'Could not load item comments.';

function hasUrl(item: Story): boolean {
    return item.url?.indexOf('http') === 0;
}

function pollBarWidth(points: number, total: number | undefined): string {
    return total ? `${(points / total) * 100}%` : '0%';
}

function TitleLink({ item, settings }: { item: Story; settings: Settings }) {
    if (hasUrl(item)) {
        return (
            <a
                className="title"
                href={item.url}
                target={settings.openLinkInNewTab ? '_blank' : undefined}
                rel={settings.openLinkInNewTab ? 'noopener' : undefined}
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

export default function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [state, setState] = useState<ItemState>({ id });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchItemContent(Number(id), controller.signal).then(
            (item) => setState({ id, item }),
            (error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setState({ id, error: ERROR_MESSAGE });
            }
        );
        return () => controller.abort();
    }, [id]);

    const current = state.id === id ? state : { id };
    const { item, error } = current;
    const goBack = () => navigate(-1);

    return (
        <div className="main-content item-view" data-testid="item-details" data-item-id={id}>
            {!item && !error && <Loader />}
            {!item && error && <ErrorMessage message={error} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span
                                className="back-button"
                                role="button"
                                tabIndex={0}
                                aria-label="Back"
                                onClick={goBack}
                                onKeyDown={onActivateKey(goBack)}
                            ></span>
                            <TitleLink item={item} settings={settings} />
                        </p>
                    </div>
                    <div
                        className={[
                            'laptop',
                            ((item.comments_count ?? 0) > 0 || item.type === 'job') && 'item-header',
                            item.text && 'head-margin',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        data-testid="laptop-header"
                    >
                        <p>
                            <TitleLink item={item} settings={settings} />
                            {hasUrl(item) && item.domain && (
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
                            )}{' '}
                            <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' | '}
                                        <NavLink to={`/item/${item.id}`}>
                                            {formatCommentCount(item.comments_count ?? 0)}
                                        </NavLink>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll?.map((pollResult, i) => (
                                <div key={i} className="pollContent" data-testid="poll-option">
                                    <SafeHtml html={pollResult.content} />
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{ width: pollBarWidth(pollResult.points, item.poll_votes_count) }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <SafeHtml as="p" className="subject" html={item.content} />
                    <ul className="comment-list">
                        {item.comments?.map((comment) => (
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
