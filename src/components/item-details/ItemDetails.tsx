import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchItemContent } from '../../api/hackerNewsApi';
import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../models';
import { formatCommentCount } from '../../utils/formatCommentCount';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Comment from './Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItem(null);
        setErrorMessage('');

        fetchItemContent(Number(id), controller.signal)
            .then(setItem)
            .catch((error: unknown) => {
                if (!controller.signal.aborted) {
                    setErrorMessage('Could not load item comments.');
                }
                return error;
            });
        window.scrollTo(0, 0);

        return () => controller.abort();
    }, [id]);

    if (!item) {
        return (
            <div className="main-content">
                {!errorMessage ? <Loader /> : <ErrorMessage message={errorMessage} />}
            </div>
        );
    }

    const hasUrl = item.url.indexOf('http') === 0;
    const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
    const laptopClasses = ['laptop'];
    if (item.comments_count > 0 || item.type === 'job') {
        laptopClasses.push('item-header');
    }
    if (item.content) {
        laptopClasses.push('head-margin');
    }

    return (
        <div className="main-content">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span className="back-button" role="button" aria-label="Go back" onClick={() => navigate(-1)} />
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
                <div className={laptopClasses.join(' ')}>
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
                {item.type === 'poll' && item.poll && (
                    <div className="pollResults">
                        {item.poll.map((pollResult, index) => (
                            <div className="pollContent" key={index}>
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    data-testid="poll-bar"
                                    style={{ width: `${(pollResult.points / (item.poll_votes_count || 1)) * 100}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
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
