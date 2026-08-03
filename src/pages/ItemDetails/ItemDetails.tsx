import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Comment } from '../../components/Comment/Comment';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import { useSettings } from '../../context/settingsContext';
import { useRequest } from '../../hooks/useRequest';
import type { Story } from '../../models';
import { fetchItemContent } from '../../services/hackernewsApi';
import { commentLabel } from '../../utils/commentLabel';
import './ItemDetails.scss';

export function ItemDetails() {
    const { id } = useParams();
    const itemID = Number(id);
    const navigate = useNavigate();
    const { settings } = useSettings();

    const { data: item, error } = useRequest<Story>(
        (signal) => fetchItemContent(itemID, signal),
        'Could not load item comments.',
        [itemID]
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const hasUrl = item?.url?.indexOf('http') === 0;
    const isJob = item?.type === 'job';
    const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    const laptopClassNames = ['laptop'];
    if (item && (item.comments_count > 0 || item.type === 'job')) {
        laptopClassNames.push('item-header');
    }
    if (item?.text) {
        laptopClassNames.push('head-margin');
    }

    return (
        <div className="main-content">
            {!item && !error && <Loader />}
            {!item && error !== '' && <ErrorMessage message={error} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span
                                className="back-button"
                                onClick={() => navigate(-1)}
                                role="button"
                                aria-label="Go back"
                            ></span>
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
                    <div className={laptopClassNames.join(' ')}>
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
                                        <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
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
                                        style={{
                                            width: `${(pollResult.points / (item.poll_votes_count || 1)) * 100}%`,
                                        }}
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
