import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Story } from '../types/story';
import { fetchItemContent } from '../services/hackerNewsApi';
import { useSettings } from '../context/SettingsContext';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { Comment as CommentView } from '../components/Comment';
import { formatCommentCount } from '../utils/commentPipe';

export function ItemDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItem(null);
        setErrorMessage('');
        const numId = id ? parseInt(id, 10) : NaN;
        if (!Number.isNaN(numId)) {
            fetchItemContent(numId, controller.signal)
                .then((data) => setItem(data))
                .catch((err) => {
                    if (err instanceof DOMException && err.name === 'AbortError') return;
                    setErrorMessage('Could not load item comments.');
                });
        }
        window.scrollTo(0, 0);
        return () => controller.abort();
    }, [id]);

    const hasUrl = !!item && item.url && item.url.indexOf('http') === 0;
    const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
    const linkRel = settings.openLinkInNewTab ? 'noopener noreferrer' : undefined;

    return (
        <div className="main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage && <ErrorMessage message={errorMessage} />}
            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {hasUrl ? (
                                <a
                                    className="title"
                                    href={item.url}
                                    target={linkTarget}
                                    rel={linkRel}
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
                        className={
                            'laptop' +
                            (item.comments_count > 0 || item.type === 'job' ? ' item-header' : '') +
                            (item.content ? ' head-margin' : '')
                        }
                    >
                        {hasUrl ? (
                            <p>
                                <a
                                    className="title"
                                    href={item.url}
                                    target={linkTarget}
                                    rel={linkRel}
                                >
                                    {item.title}
                                </a>
                                {item.domain && (
                                    <span className="domain"> ({item.domain})</span>
                                )}
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
                                        {' | '}
                                        <Link to={`/item/${item.id}`}>
                                            {formatCommentCount(item.comments_count)}
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
                                    <div
                                        dangerouslySetInnerHTML={{ __html: pollResult.content }}
                                    />
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{
                                            width: `${
                                                (pollResult.points /
                                                    (item.poll_votes_count || 1)) *
                                                100
                                            }%`,
                                        }}
                                    ></div>
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
                        {item.comments?.map((comment) => (
                            <li key={comment.id}>
                                <CommentView comment={comment} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
