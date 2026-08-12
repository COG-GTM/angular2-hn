import DOMPurify from 'dompurify';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useItem } from '../api/queries';
import Comment from '../components/Comment';
import { useSettings } from '../context/useSettings';
import { formatComment } from '../utils/formatComment';

import './ItemDetailsPage.scss';

export default function ItemDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const itemId = Number(id);
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { data: item, isError } = useItem(itemId);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemId]);

    if (!item) {
        return (
            <div className="main-content">
                {isError ? (
                    <div className="error-section">
                        <div className="skull">
                            <div className="head">
                                <div className="crack" />
                            </div>
                            <div className="mouth">
                                <div className="teeth" />
                            </div>
                        </div>
                        <p className="strong">Could not load item comments.</p>
                        <p>
                            If you are offline viewing, you&apos;ll need to visit this page with a network connection
                            first before it can work offline.
                        </p>
                    </div>
                ) : (
                    <div className="loading-section">
                        <div className="loader">Loading...</div>
                    </div>
                )}
            </div>
        );
    }

    const hasUrl = item.url?.indexOf('http') === 0;
    const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
    const laptopClassName = [
        'laptop',
        item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
        item.content ? 'head-margin' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className="main-content">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span className="back-button" onClick={() => navigate(-1)} />
                        {hasUrl ? (
                            <a className="title" href={item.url} {...externalLinkProps}>
                                {item.title}
                            </a>
                        ) : (
                            <Link className="title" to={`/item/${item.id}`}>
                                {item.title}
                            </Link>
                        )}
                    </p>
                </div>
                <div className={laptopClassName}>
                    {hasUrl ? (
                        <p>
                            <a className="title" href={item.url} {...externalLinkProps}>
                                {item.title}
                            </a>
                            {item.domain && <span className="domain">({item.domain})</span>}
                        </p>
                    ) : (
                        <p>
                            <Link className="title" to={`/item/${item.id}`}>
                                {item.title}
                            </Link>
                        </p>
                    )}
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
                                    {' | '}
                                    <Link to={`/item/${item.id}`}>{formatComment(item.comments_count)}</Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {(item.poll ?? []).map((pollResult, index) => (
                            <div className="pollContent" key={index}>
                                <div
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pollResult.content ?? '') }}
                                />
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                />
                            </div>
                        ))}
                    </div>
                )}
                <p className="subject" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content ?? '') }} />
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
