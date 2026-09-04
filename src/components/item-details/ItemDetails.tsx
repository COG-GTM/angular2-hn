import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../models/story';
import { fetchItemContent } from '../../services/hackernews-api';
import { commentCount } from '../../utils/comment';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Comment from './Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItem(null);
        setErrorMessage('');

        fetchItemContent(Number(id), controller.signal)
            .then(setItem)
            .catch((error: unknown) => {
                if (!controller.signal.aborted) {
                    setErrorMessage('Could not load item comments.');
                    console.error(error);
                }
            });

        window.scrollTo(0, 0);
        return () => controller.abort();
    }, [id]);

    const hasUrl = item && item.url ? item.url.indexOf('http') === 0 : false;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

    return (
        <div className="c-item-details main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
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
                    <div
                        className={
                            'laptop' +
                            (item.comments_count > 0 || item.type === 'job' ? ' item-header' : '') +
                            (item.text ? ' head-margin' : '')
                        }
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
                                        {' | '}
                                        <Link to={`/item/${item.id}`}>{commentCount(item.comments_count)}</Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll.map((pollResult, index) => (
                                <div key={index} className="pollContent">
                                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }}></p>
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
