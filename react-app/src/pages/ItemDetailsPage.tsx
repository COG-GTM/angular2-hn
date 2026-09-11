import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Comment } from '../components/Comment/Comment';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';
import { Loader } from '../components/Loader/Loader';
import { useSettings } from '../context/SettingsContext';
import { fetchItemContent } from '../services/hackerNewsApi';
import { formatCommentCount } from '../utils/comment';
import type { Story } from '../types';
import './ItemDetailsPage.scss';

export function ItemDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        const controller = new AbortController();
        if (!id) return () => controller.abort();
        fetchItemContent(Number(id), controller.signal)
            .then(setItem)
            .catch((error: unknown) => {
                if ((error as Error).name !== 'AbortError') setErrorMessage('Could not load item comments.');
            });
        window.scrollTo(0, 0);
        return () => controller.abort();
    }, [id]);
    if (!item && !errorMessage)
        return (
            <div className="main-content">
                <Loader />
            </div>
        );
    if (!item)
        return (
            <div className="main-content">
                <ErrorMessage message={errorMessage} />
            </div>
        );
    const hasUrl = item.url?.indexOf('http') === 0;
    const externalProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
    const title = hasUrl ? (
        <a className="title" href={item.url} {...externalProps}>
            {item.title}
        </a>
    ) : (
        <Link className="title" to={`/item/${item.id}`}>
            {item.title}
        </Link>
    );
    const handleBackKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigate(-1);
        }
    };
    return (
        <div className="main-content">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span
                            className="back-button"
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(-1)}
                            onKeyDown={handleBackKeyDown}
                            aria-label="Go back"
                        />
                        {title}
                    </p>
                </div>
                <div
                    className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.text ? ' head-margin' : ''}`}
                >
                    <p>
                        {title}
                        {hasUrl && item.domain && <span className="domain">({item.domain})</span>}
                    </p>
                    <div className="subtext">
                        {item.type !== 'job' && (
                            <span>
                                {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                            </span>
                        )}
                        <span className={item.type !== 'job' ? 'item-details' : undefined}>
                            {item.time_ago}
                            {item.type !== 'job' && (
                                <>
                                    {' '}
                                    | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                                </>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {item.poll.map((result, index) => (
                            <div className="pollContent" key={`${result.content}-${index}`}>
                                <div dangerouslySetInnerHTML={{ __html: result.content }} />
                                <div className="subtext">{result.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{
                                        width: `${item.poll_votes_count ? (result.points / item.poll_votes_count) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}
                <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? item.text ?? '' }} />
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
