import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchItemContent } from '../api/hackerNews';
import { useSettings } from '../context/SettingsContext';
import { Story } from '../models/Story';
import { commentLabel } from '../utils/commentLabel';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import Comment from './Comment';
import '../app/item-details/item-details.component.scss';

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
        const itemId = parseInt(id!, 10);

        fetchItemContent(itemId, controller.signal)
            .then((data) => setItem(data))
            .catch((err) => {
                if (!controller.signal.aborted) {
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
                                            width: (pollResult.points / item.poll_votes_count) * 100 + '%',
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
