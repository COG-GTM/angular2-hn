import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Comment from '../../components/Comment/Comment';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loader from '../../components/Loader/Loader';
import { fetchItemContent } from '../../api/hackerNewsApi';
import { useAsync } from '../../hooks/useAsync';
import { useSettings } from '../../context/settingsContext';
import { commentLabel } from '../../utils/commentLabel';

import './ItemDetails.scss';

export default function ItemDetailsPage() {
    const { id } = useParams();
    const itemId = Number(id);
    const navigate = useNavigate();
    const { settings } = useSettings();

    const { data: item, errorMessage } = useAsync(
        (signal) => fetchItemContent(itemId, signal),
        [itemId],
        'Could not load item comments.'
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    return (
        <div className="item-details-page">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {item.url?.indexOf('http') === 0 ? (
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
                    <div className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}`}>
                        {item.url?.indexOf('http') === 0 ? (
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
                                        <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll.map((pollResult) => (
                                <div className="pollContent" key={pollResult.content}>
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
