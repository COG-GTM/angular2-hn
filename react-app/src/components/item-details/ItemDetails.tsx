import { useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../api/hackernews';
import { useFetch } from '../../api/useFetch';
import type { Story } from '../../models/story';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import { useSettings } from '../../context/SettingsContext';
import { formatCommentCount } from '../../utils/formatCommentCount';

import Comment from './Comment';

import './ItemDetails.scss';

/** The API item carries `text` and `content` fields the frozen `Story` model does not declare. */
type ItemDetailsStory = Story & { text?: string; content?: string };

export function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { openLinkInNewTab } = useSettings();
    const {
        data: item,
        loading,
        error,
    } = useFetch<ItemDetailsStory>((signal) => fetchItemContent(Number(id), signal), [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const hasUrl = !!item && !!item.url && item.url.indexOf('http') === 0;
    const laptopClassName = ['laptop'];
    if (item && (item.comments_count > 0 || item.type === 'job')) {
        laptopClassName.push('item-header');
    }
    if (item && item.text) {
        laptopClassName.push('head-margin');
    }

    return (
        <div className="main-content">
            {loading && <Loader />}
            {!item && !loading && error && <ErrorMessage message="Could not load item comments." />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {hasUrl ? (
                                <a
                                    className="title"
                                    href={item.url}
                                    target={openLinkInNewTab ? '_blank' : undefined}
                                    rel={openLinkInNewTab ? 'noopener' : undefined}
                                >
                                    {item.title}
                                </a>
                            ) : (
                                <NavLink className="title" to={`/item/${item.id}`}>
                                    {item.title}
                                </NavLink>
                            )}
                        </p>
                    </div>
                    <div className={laptopClassName.join(' ')}>
                        {hasUrl ? (
                            <p>
                                <a
                                    className="title"
                                    href={item.url}
                                    target={openLinkInNewTab ? '_blank' : undefined}
                                    rel={openLinkInNewTab ? 'noopener' : undefined}
                                >
                                    {item.title}
                                </a>
                                {item.domain && <span className="domain">({item.domain})</span>}
                            </p>
                        ) : (
                            <p>
                                <NavLink className="title" to={`/item/${item.id}`}>
                                    {item.title}
                                </NavLink>
                            </p>
                        )}
                        <div className="subtext">
                            {item.type !== 'job' && (
                                <span>
                                    {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' | '}
                                        <NavLink to={`/item/${item.id}`}>
                                            {formatCommentCount(item.comments_count)}
                                        </NavLink>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll?.map((pollResult, index) => (
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
                    <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
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

export default ItemDetails;
