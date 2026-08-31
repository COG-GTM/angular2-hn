import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import { Story } from '../../models/story';
import { fetchItemContent } from '../../services/hackernewsApi';
import { formatComments } from '../../utils/formatComments';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Comment from './Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!id) {
            return;
        }

        let cancelled = false;
        setItem(null);
        setErrorMessage('');
        window.scrollTo(0, 0);

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

        return () => {
            cancelled = true;
        };
    }, [id]);

    const hasUrl = !!item && item.url?.indexOf('http') === 0;
    const isJob = item?.type === 'job';
    const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    return (
        <div className="item-view main-content">
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
                            item.comments_count > 0 || isJob ? 'item-header' : '',
                            item.content ? 'head-margin' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {hasUrl ? (
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
                            {!isJob && (
                                <span>
                                    {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                            )}
                            <span className={isJob ? undefined : 'item-details'}>
                                {item.time_ago}
                                {!isJob && (
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
                                    <div dangerouslySetInnerHTML={sanitizeHtml(pollResult.content)}></div>
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={sanitizeHtml(item.content ?? '')}></p>
                    <ul className="comment-list">
                        {item.comments?.map(comment => (
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
