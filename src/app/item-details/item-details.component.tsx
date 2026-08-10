import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../shared/services/hackernews-api.service';
import { useSettings } from '../shared/services/settings-context';
import { Story } from '../shared/models/story';
import { formatCommentCount } from '../shared/pipes/comment.pipe';
import CommentItem from './comment/comment.component';
import Loader from '../shared/components/loader/loader.component';
import ErrorMessage from '../shared/components/error-message/error-message.component';
import './item-details.component.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setItem(undefined);
        setErrorMessage('');

        fetchItemContent(+id)
            .then(story => {
                if (!cancelled) {
                    setItem(story);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage('Could not load item comments.');
                }
            });

        window.scrollTo(0, 0);

        return () => {
            cancelled = true;
        };
    }, [id]);

    const hasUrl = item ? item.url.indexOf('http') === 0 : false;
    const laptopClasses = ['laptop'];
    if (item && (item.comments_count > 0 || item.type === 'job')) {
        laptopClasses.push('item-header');
    }
    if (item && item.text) {
        laptopClasses.push('head-margin');
    }

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
                        <div className={laptopClasses.join(' ')}>
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
                                    <div key={index} className="pollContent">
                                        <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
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
                        <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }}></p>
                        <ul className="comment-list">
                            {item.comments.map(comment => (
                                <li key={comment.id}>
                                    <CommentItem comment={comment} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
