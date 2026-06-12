import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import DOMPurify from 'dompurify';
import { fetchItemContent } from '../../services/hackernews-api';
import { useSettings } from '../../contexts/SettingsContext';
import { formatCommentCount } from '../../utils/formatComment';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Comment from '../../components/Comment/Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openLinkInNewTab } = useSettings();
    const itemId = id ? parseInt(id, 10) : 0;

    const { data: item, error } = useQuery({
        queryKey: ['item', itemId],
        queryFn: () => fetchItemContent(itemId),
        enabled: itemId > 0,
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemId]);

    const goBack = () => navigate(-1);
    const hasUrl = item?.url && item.url.indexOf('http') === 0;
    const target = openLinkInNewTab ? '_blank' : undefined;
    const rel = openLinkInNewTab ? 'noopener' : undefined;

    if (!item && !error) return <Loader />;
    if (!item && error) return <ErrorMessage message="Could not load item comments." />;
    if (!item) return null;

    return (
        <div className="main-content">
            <div className="item">
                {/* Mobile header */}
                <div className="mobile item-header">
                    <p className="title-block">
                        <span className="back-button" onClick={goBack} />
                        {hasUrl ? (
                            <a className="title" href={item.url} target={target} rel={rel}>
                                {item.title}
                            </a>
                        ) : (
                            <Link className="title" to={`/item/${item.id}`}>
                                {item.title}
                            </Link>
                        )}
                    </p>
                </div>

                {/* Laptop header */}
                <div
                    className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.text || item.content ? ' head-margin' : ''}`}
                >
                    {hasUrl ? (
                        <p>
                            <a className="title" href={item.url} target={target} rel={rel}>
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
                                    {' '}
                                    |{' '}
                                    <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Poll results */}
                {item.type === 'poll' && item.poll && (
                    <div className="pollResults">
                        {item.poll.map((pollResult, i) => (
                            <div key={i} className="pollContent">
                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pollResult.content) }} />
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{ width: `${item.poll_votes_count > 0 ? (pollResult.points / item.poll_votes_count) * 100 : 0}%` }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Item content / text */}
                {item.content && (
                    <p
                        className="subject"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }}
                    />
                )}

                {/* Comments */}
                <ul className="comment-list">
                    {item.comments?.map((comment) => (
                        <li key={comment.id}>
                            <Comment comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
