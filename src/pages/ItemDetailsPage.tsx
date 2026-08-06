import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../api/hackerNews';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useSettings } from '../context/SettingsContext';
import { Comment } from '../item-details/Comment';
import { Story } from '../models/story';
import { formatCommentCount } from '../utils/formatCommentCount';
import '../item-details/itemDetails.scss';

export function ItemDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setItem(null);
        setErrorMessage('');

        fetchItemContent(Number(id)).then(
            (story) => {
                if (!cancelled) {
                    setItem(story);
                }
            },
            () => {
                if (!cancelled) {
                    setErrorMessage('Could not load item comments.');
                }
            }
        );

        window.scrollTo(0, 0);

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (!item) {
        return (
            <div className="main-content">
                {errorMessage === '' ? <Loader /> : <ErrorMessage message={errorMessage} />}
            </div>
        );
    }

    const hasUrl = item.url !== undefined && item.url.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;
    const laptopClassName = [
        'laptop',
        item.comments_count > 0 || isJob ? 'item-header' : '',
        item.content ? 'head-margin' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className="main-content">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span className="back-button" onClick={() => navigate(-1)}></span>
                        {hasUrl ? (
                            <a className="title" href={item.url} target={target} rel={rel}>
                                {item.title}
                            </a>
                        ) : (
                            <NavLink className="title" to={`/item/${item.id}`}>
                                {item.title}
                            </NavLink>
                        )}
                    </p>
                </div>
                <div className={laptopClassName}>
                    {hasUrl ? (
                        <p>
                            <a className="title" href={item.url} target={target} rel={rel}>
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
                        {!isJob && (
                            <span>
                                {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                            </span>
                        )}
                        <span className={isJob ? '' : 'item-details'}>
                            {item.time_ago}
                            {!isJob && (
                                <span>
                                    {' | '}
                                    <NavLink to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</NavLink>
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
                                    style={{ width: `${(pollResult.points / (item.poll_votes_count ?? 0)) * 100}%` }}
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
        </div>
    );
}

export default ItemDetailsPage;
