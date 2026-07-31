import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { CommentThread } from '../../components/CommentThread/CommentThread';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import { useSettings } from '../../context/settingsContext';
import { useApiRequest } from '../../hooks/useApiRequest';
import { fetchItemContent } from '../../services/hackerNewsApi';
import { formatCommentCount } from '../../utils/formatCommentCount';

import './ItemDetails.scss';

export function ItemDetails() {
    const { id } = useParams();
    const itemId = Number(id);
    const navigate = useNavigate();
    const { settings } = useSettings();

    const { data: item, error } = useApiRequest(
        (signal) => fetchItemContent(itemId, signal),
        'Could not load item comments.',
        [itemId]
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemId]);

    if (!item) {
        return <div className="main-content">{error === '' ? <Loader /> : <ErrorMessage message={error} />}</div>;
    }

    const hasUrl = item.url?.startsWith('http') ?? false;
    const isJob = item.type === 'job';
    const linkTarget = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    const titleLink = hasUrl ? (
        <a className="title" href={item.url} {...linkTarget}>
            {item.title}
        </a>
    ) : (
        <Link className="title" to={`/item/${item.id}`}>
            {item.title}
        </Link>
    );

    const laptopClasses = ['laptop'];
    if (item.comments_count > 0 || isJob) {
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
                        <span className="back-button" onClick={() => navigate(-1)} />
                        {titleLink}
                    </p>
                </div>
                <div className={laptopClasses.join(' ')}>
                    <p>
                        {titleLink}
                        {hasUrl && item.domain && <span className="domain">({item.domain})</span>}
                    </p>
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
                                    {' '}
                                    | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {item.poll?.map((pollResult, index) => (
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
                <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
                <ul className="comment-list">
                    {item.comments?.map((comment) => (
                        <li key={comment.id}>
                            <CommentThread comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
