import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../api/hackerNewsApi';
import Comment from '../components/Comment';
import ErrorMessage from '../components/ErrorMessage';
import { hasUrl } from '../components/Item';
import Loader from '../components/Loader';
import { useSettings } from '../context/SettingsContext';
import { Story } from '../models';
import { formatCommentCount } from '../utils/formatCommentCount';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setItem(null);
        setErrorMessage('');
        window.scrollTo(0, 0);

        fetchItemContent(Number(id))
            .then((story) => {
                if (!cancelled) {
                    setItem(story);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage('Could not load item comments.');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    return (
        <div className="item-details-page">
            <div className="main-content">
                {!item && !errorMessage && <Loader />}
                {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

                {item && (
                    <div className="item">
                        <div className="mobile item-header">
                            <p className="title-block">
                                <span className="back-button" onClick={() => navigate(-1)}></span>
                                {hasUrl(item) ? (
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
                        <div
                            className={[
                                'laptop',
                                item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
                                item.content ? 'head-margin' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {hasUrl(item) ? (
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
                                            {' '}
                                            |{' '}
                                            <Link to={`/item/${item.id}`}>
                                                {formatCommentCount(item.comments_count)}
                                            </Link>
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                        {item.type === 'poll' && (
                            <div className="pollResults">
                                {item.poll.map((pollResult, index) => (
                                    <div className="pollContent" key={index}>
                                        <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
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
                        <p className="subject" dangerouslySetInnerHTML={{ __html: item.content || '' }}></p>
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
        </div>
    );
}
