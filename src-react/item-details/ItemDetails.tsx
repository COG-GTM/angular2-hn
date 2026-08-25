import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../shared/api/hackernewsApi';
import ErrorMessage from '../shared/components/error-message/ErrorMessage';
import Loader from '../shared/components/loader/Loader';
import type { Story } from '../shared/models';
import { useSettings } from '../shared/settings/SettingsContext';
import { formatComments } from '../shared/utils/formatComments';
import Comment from './comment/Comment';
import './ItemDetails.scss';

function ItemDetails() {
    const params = useParams<{ id?: string }>();
    const itemID = Number(params.id);
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story>();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let ignore = false;
        window.scrollTo(0, 0);
        setErrorMessage('');

        fetchItemContent(itemID)
            .then((nextItem) => {
                if (!ignore) {
                    setItem(nextItem);
                }
            })
            .catch(() => {
                if (!ignore) {
                    setErrorMessage('Could not load item comments.');
                }
            });

        return () => {
            ignore = true;
        };
    }, [itemID]);

    const goBack = () => {
        navigate(-1);
    };

    const hasUrl = item?.url?.indexOf('http') === 0;

    return (
        <div className="main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={goBack} />
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
                        className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${
                            item.text ? ' head-margin' : ''
                        }`}
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
                                    {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' | '}
                                        <Link to={`/item/${item.id}`}>{formatComments(item.comments_count)}</Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll.map((pollResult, index) => (
                                <div className="pollContent" key={index}>
                                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }} />
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

export default ItemDetails;
