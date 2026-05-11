import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchItemContent } from '../../services/hackerNewsApi';
import { useSettings } from '../../services/useSettings';
import { commentLabel } from '../../utils/commentLabel';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Comment from '../Comment/Comment';
import type { Story } from '../../types';
import './ItemDetails.scss';

interface ItemDetailsProps {
    itemId: number;
}

export default function ItemDetails({ itemId }: ItemDetailsProps) {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        fetchItemContent(itemId)
            .then((data) => { if (!cancelled) setItem(data); })
            .catch(() => { if (!cancelled) setErrorMessage('Could not load item comments.'); });
        window.scrollTo(0, 0);
        return () => { cancelled = true; };
    }, [itemId]);

    const goBack = () => navigate(-1);
    const hasUrl = item ? item.url && item.url.indexOf('http') === 0 : false;

    return (
        <div className="main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={goBack}></span>
                            {hasUrl ? (
                                <a
                                    className="title"
                                    href={item.url}
                                    target={settings.openLinkInNewTab ? '_blank' : undefined}
                                    rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                                >
                                    {item.title}
                                </a>
                            ) : (
                                <Link className="title" to={`/item/${item.id}`}>
                                    {item.title}
                                </Link>
                            )}
                        </p>
                    </div>
                    <div
                        className={`laptop${
                            item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''
                        }${item.content ? ' head-margin' : ''}`}
                    >
                        {hasUrl ? (
                            <p>
                                <a
                                    className="title"
                                    href={item.url}
                                    target={settings.openLinkInNewTab ? '_blank' : undefined}
                                    rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                                >
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
                                    {item.points} points by{' '}
                                    <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' '}
                                        |{' '}
                                        <Link to={`/item/${item.id}`}>
                                            {commentLabel(item.comments_count)}
                                        </Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && item.poll && (
                        <div className="pollResults">
                            {item.poll.map((pollResult, idx) => (
                                <div key={idx} className="pollContent">
                                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{
                                            width: `${
                                                item.poll_votes_count > 0
                                                    ? (pollResult.points / item.poll_votes_count) * 100
                                                    : 0
                                            }%`,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {item.content && (
                        <p
                            className="subject"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                    )}
                    <ul className="comment-list">
                        {item.comments &&
                            item.comments.map((comment) => (
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
