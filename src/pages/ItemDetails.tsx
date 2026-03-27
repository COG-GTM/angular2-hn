import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Story } from '../types/story';
import { useSettings } from '../hooks/useSettings';
import { fetchItemContent } from '../hooks/useHackerNewsApi';
import { formatComment } from '../utils/formatComment';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';
import Comment from '../components/Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setItem(null);
        setErrorMessage('');
        fetchItemContent(parseInt(id, 10))
            .then((data) => {
                if (!cancelled) setItem(data);
            })
            .catch(() => {
                if (!cancelled) setErrorMessage('Could not load item comments.');
            });
        window.scrollTo(0, 0);
        return () => { cancelled = true; };
    }, [id]);

    const goBack = () => navigate(-1);
    const hasUrl = item?.url?.indexOf('http') === 0;

    return (
        <div className="main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
                        className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}
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
                                {item.domain && <span className="domain"> ({item.domain})</span>}
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
                                            {formatComment(item.comments_count)}
                                        </Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && item.poll && (
                        <div className="pollResults">
                            {item.poll.map((pollResult, index) => (
                                <div key={index} className="pollContent">
                                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{
                                            width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    {item.content && (
                        <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
                    )}
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
