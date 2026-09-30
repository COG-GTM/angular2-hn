import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import type { Story } from '../models';
import { formatCommentCount } from '../services/commentCount';
import { fetchItemContent } from '../services/hackernewsApi';
import { linkTargetProps, useSettings } from '../settings/useSettings';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import { sanitizedHtml } from '../shared/sanitize';
import Comment from './Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        fetchItemContent(Number(id), controller.signal, setItem).then(setItem, () => {
            if (!controller.signal.aborted) setErrorMessage('Could not load item comments.');
        });
        window.scrollTo(0, 0);
        return () => controller.abort();
    }, [id]);

    if (!item) {
        return (
            <div className="main-content">
                {!errorMessage && <Loader />}
                {errorMessage !== '' && <ErrorMessage message={errorMessage} />}
            </div>
        );
    }

    const hasUrl = item.url.indexOf('http') === 0;
    const isJob = item.type === 'job';
    const title = hasUrl ? (
        <a className="title" href={item.url} {...linkTargetProps(settings.openLinkInNewTab)}>
            {` ${item.title} `}
        </a>
    ) : (
        <Link className="title" to={`/item/${item.id}`}>
            {` ${item.title} `}
        </Link>
    );
    const laptopClass = item.comments_count > 0 || isJob ? 'laptop item-header' : 'laptop';

    return (
        <div className="main-content">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span className="back-button" onClick={() => navigate(-1)}></span>
                        {title}
                    </p>
                </div>
                <div className={laptopClass}>
                    <p>
                        {title}
                        {hasUrl && item.domain && <span className="domain">({item.domain})</span>}
                    </p>
                    <div className="subtext">
                        {!isJob && (
                            <span>
                                {` ${item.points} points by `}
                                <Link to={`/user/${item.user}`}>{item.user}</Link>
                            </span>
                        )}
                        <span className={!isJob ? 'item-details' : undefined}>
                            {` ${item.time_ago} `}
                            {!isJob && (
                                <span>
                                    {' | '}
                                    <Link to={`/item/${item.id}`}>{` ${formatCommentCount(item.comments_count)} `}</Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {item.poll?.map((pollResult, index) => (
                            <div key={index} className="pollContent">
                                <div dangerouslySetInnerHTML={sanitizedHtml(pollResult.content)}></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{ width: `${(pollResult.points / (item.poll_votes_count ?? 0)) * 100}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="subject" dangerouslySetInnerHTML={sanitizedHtml(item.content)}></p>
                <ul className="comment-list">
                    {item.comments.map((comment) => (
                        <li key={comment.id}>
                            <Comment comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
