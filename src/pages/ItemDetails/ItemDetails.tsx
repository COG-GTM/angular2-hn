import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Story } from '../../types/story';
import { fetchItemContent } from '../../services/hackernews-api';
import { useSettings } from '../../context/SettingsContext';
import { formatComment } from '../../utils/formatComment';
import Comment from '../../components/Comment/Comment';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setItem(null);
        setErrorMessage('');
        const controller = new AbortController();
        const itemID = parseInt(id!, 10);

        fetchItemContent(itemID, controller.signal)
            .then((data) => setItem(data))
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setErrorMessage('Could not load item comments.');
                }
            });

        window.scrollTo(0, 0);
        return () => controller.abort();
    }, [id]);

    const goBack = () => navigate(-1);
    const hasUrl = item ? item.url && item.url.indexOf('http') === 0 : false;

    return (
        <div className="main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className="item">
                    {/* Mobile header */}
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

                    {/* Laptop header */}
                    <div
                        className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.text ? ' head-margin' : ''}`}
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
                            <span className={item.type !== 'job' ? 'item-details' : ''}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' | '}
                                        <Link to={`/item/${item.id}`}>
                                            {formatComment(item.comments_count)}
                                        </Link>
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
                                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{
                                            width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Item content */}
                    {item.content && (
                        <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
                    )}

                    {/* Comments */}
                    {item.comments && (
                        <ul className="comment-list">
                            {item.comments.map((comment) => (
                                <li key={comment.id}>
                                    <Comment comment={comment} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
