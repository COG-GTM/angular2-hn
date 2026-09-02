import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ErrorMessage, Loader } from '../../shared/components';
import type { Story } from '../../shared/models';
import { hackerNewsApi } from '../../shared/services/hackernews-api';
import { useSettings } from '../../shared/settings/SettingsContext';
import { formatCommentCount } from '../../shared/utils/comment-count';
import { Comment } from './Comment';

import './ItemDetails.scss';

type ItemStory = Story & {
    text?: string;
    content?: string;
};

export function ItemDetails() {
    const { id } = useParams();
    const itemId = Number(id);
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<ItemStory | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let cancelled = false;
        setItem(null);
        setErrorMessage('');

        hackerNewsApi.fetchItemContent(itemId).then(
            (result) => {
                if (!cancelled) {
                    setItem(result);
                }
            },
            () => {
                if (!cancelled) {
                    setErrorMessage('Could not load item comments.');
                }
            }
        );

        return () => {
            cancelled = true;
        };
    }, [itemId]);

    const goBack = () => navigate(-1);
    const newTab = settings.openLinkInNewTab;
    const target = newTab ? '_blank' : undefined;
    const rel = newTab ? 'noopener' : undefined;
    const hasUrl = item?.url.indexOf('http') === 0;

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
                        className={[
                            'laptop',
                            (item.comments_count > 0 || item.type === 'job') && 'item-header',
                            item.text && 'head-margin',
                        ]
                            .filter(Boolean)
                            .join(' ')}
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
                                        <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll.map((pollResult, index) => (
                                <div key={index} className="pollContent">
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
