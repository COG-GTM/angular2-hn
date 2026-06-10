import { useParams, useNavigate, Link } from 'react-router-dom';
import { Story } from '../models/story';
import { fetchItemContent, useApiFetch } from '../hooks/useHackerNewsApi';
import { useSettings } from '../contexts/SettingsContext';
import { formatComment } from '../utils/formatComment';
import Comment from '../components/Comment';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';
import './ItemDetailPage.scss';

export default function ItemDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const itemId = Number(id);

    const { data: item, error } = useApiFetch<Story>(
        () => fetchItemContent(itemId),
        [itemId],
        'Could not load item comments.',
        () => window.scrollTo(0, 0),
    );

    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

    const hasUrl = item ? item.url.indexOf('http') === 0 : false;

    let laptopClass = 'laptop';
    if (item && (item.comments_count > 0 || item.type === 'job')) {
        laptopClass += ' item-header';
    }
    if (item && item.text) {
        laptopClass += ' head-margin';
    }

    return (
        <div className="main-content item-details-view">
            {!item && !error && <Loader />}
            {!item && error !== '' && <ErrorMessage message={error} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
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
                    <div className={laptopClass}>
                        {hasUrl ? (
                            <p>
                                <a className="title" href={item.url} target={target} rel={rel}>
                                    {item.title}
                                </a>{' '}
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
                                    {item.points} points by{' '}
                                    <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                {item.time_ago}{' '}
                                {item.type !== 'job' && (
                                    <span>
                                        {' '}|{' '}
                                        <Link to={`/item/${item.id}`}>
                                            {formatComment(item.comments_count)}
                                        </Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll.map((pollResult, idx) => (
                                <div className="pollContent" key={idx}>
                                    <div
                                        dangerouslySetInnerHTML={{ __html: pollResult.content }}
                                    ></div>
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{
                                            width:
                                                (pollResult.points / item.poll_votes_count) * 100 +
                                                '%',
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }}></p>
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
