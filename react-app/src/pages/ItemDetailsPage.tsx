import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchItemContent } from '../api/hackerNewsApi';
import { Comment } from '../components/Comment/Comment';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';
import { Loader } from '../components/Loader/Loader';
import type { Story } from '../models';
import { useSettings } from '../settings';
import { formatCommentCount } from '../utils/commentCount';
import { buttonProps } from '../utils/activateOnKey';
import { sanitizedHtml } from '../utils/sanitize';
import './ItemDetailsPage.scss';

type ItemState = { id: number; item?: Story; error?: string };

function ItemTitle({ item }: { item: Story }) {
    const { settings } = useSettings();
    if (item.url.indexOf('http') === 0) {
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
        <Link className="title" to={`/item/${item.id}`}>
            {item.title}
        </Link>
    );
}

export default function ItemDetailsPage() {
    const id = Number(useParams().id);
    const navigate = useNavigate();
    const [state, setState] = useState<ItemState>({ id });

    useEffect(() => {
        const controller = new AbortController();
        window.scrollTo(0, 0);
        fetchItemContent(id, controller.signal).then(
            (item) => {
                if (!controller.signal.aborted) setState({ id, item });
            },
            () => {
                if (!controller.signal.aborted) {
                    setState({ id, error: 'Could not load item comments.' });
                }
            }
        );
        return () => controller.abort();
    }, [id]);

    const { item, error } = state.id === id ? state : { item: undefined, error: undefined };
    const isJob = item?.type === 'job';

    return (
        <div className="main-content item-page" data-testid="item-page">
            {!item && !error && <Loader />}
            {!item && error && <ErrorMessage message={error} />}
            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" aria-label="Back" {...buttonProps(() => navigate(-1))} />
                            <ItemTitle item={item} />
                        </p>
                    </div>
                    <div
                        className={[
                            'laptop',
                            item.comments_count > 0 || isJob ? 'item-header' : '',
                            item.content ? 'head-margin' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        <p>
                            <ItemTitle item={item} />
                            {item.url.indexOf('http') === 0 && item.domain && (
                                <span className="domain"> ({item.domain})</span>
                            )}
                        </p>
                        <div className="subtext">
                            {!isJob && (
                                <span>
                                    {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                            )}
                            <span className={isJob ? undefined : 'item-details'}>
                                {item.time_ago}
                                {!isJob && (
                                    <span>
                                        {' '}
                                        | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && item.poll && (
                        <div className="pollResults">
                            {item.poll.map((result, i) => {
                                // A poll option that failed to load keeps its empty placeholder entry.
                                const points = result.points ?? 0;
                                const total = item.poll_votes_count ?? 0;
                                return (
                                    <div key={i} className="pollContent">
                                        <div dangerouslySetInnerHTML={sanitizedHtml(result.content)} />
                                        <div className="subtext">{points} points</div>
                                        <div
                                            className="pollBar"
                                            style={{ width: `${total ? (points / total) * 100 : 0}%` }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={sanitizedHtml(item.content)} />
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
