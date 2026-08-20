import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { CommentItem } from '../components/CommentItem';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useAsyncData } from '../hooks/useAsyncData';
import { useSettings } from '../hooks/useSettings';
import { fetchItemContent } from '../services/hackernewsApi';
import type { Story } from '../types';
import { commentLabel } from '../utils/commentLabel';
import './ItemDetailsPage.scss';

export function ItemDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const itemID = Number(id);
    const { data: item, errorMessage } = useAsyncData<Story>(
        (signal) => fetchItemContent(itemID, signal),
        `item-${itemID}`,
        'Could not load item comments.'
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemID]);

    const hasUrl = item?.url?.indexOf('http') === 0;
    const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    return (
        <div className="main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {hasUrl ? (
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
                            item.text ? 'head-margin' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {hasUrl ? (
                            <p>
                                <a className="title" href={item.url} {...externalLinkProps}>
                                    {item.title}
                                </a>{' '}
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
                            {item.poll?.map((pollResult, index) => (
                                <div className="pollContent" key={index}>
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
                    <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
                    <ul className="comment-list">
                        {item.comments?.map((comment) => (
                            <li key={comment.id}>
                                <CommentItem comment={comment} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ItemDetailsPage;
