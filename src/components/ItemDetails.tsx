import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchItemContent } from '../api/hackerNews';
import { useSettings } from '../context/SettingsContext';
import { Story } from '../models/Story';
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
        if (!id) return;
        setItem(null);
        setErrorMessage('');
        const controller = new AbortController();

        fetchItemContent(parseInt(id, 10), controller.signal)
            .then((data) => {
                setItem(data);
                window.scrollTo(0, 0);
            })
            .catch((err) => {
                if (!controller.signal.aborted) {
                    setErrorMessage('Could not load item.');
                }
            });

        return () => controller.abort();
    }, [id]);

    const goBack = () => navigate(-1);
    const hasUrl = item?.url && item.url.indexOf('http') === 0;

    return (
        <div className="main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div>
                    <div className="view-top">
                        <span className="back" onClick={goBack}>
                            &#8249;
                        </span>
                    </div>
                    <div className="item-details">
                        <div
                            className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}
                        >
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
                                <span className="title">{item.title}</span>
                            )}
                            {item.domain && <span className="domain">({item.domain})</span>}
                        </div>
                        <div className="palm">
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
                                <span className="title">{item.title}</span>
                            )}
                            {item.domain && <span className="domain">({item.domain})</span>}
                        </div>
                        {item.type !== 'job' && (
                            <div className="details">
                                <span className="name">
                                    <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                                <span> {item.points} ★</span>
                                <span> | {item.time_ago}</span>
                            </div>
                        )}
                    </div>

                    {item.content && (
                        <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
                    )}

                    {item.type === 'poll' && item.poll && item.poll.length > 0 && (
                        <div className="poll">
                            {item.poll.map((option, i) => (
                                <div key={i} className="poll-option">
                                    <span
                                        className="pollBar"
                                        style={{
                                            width:
                                                item.poll_votes_count > 0
                                                    ? `${(option.points / item.poll_votes_count) * 100}%`
                                                    : '0%',
                                        }}
                                    ></span>
                                    <span className="poll-text">
                                        {option.content} - {option.points} points
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {item.comments && item.comments.length > 0 && (
                        <div className="comments">
                            {item.comments.map((comment) => (
                                <Comment key={comment.id} comment={comment} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
