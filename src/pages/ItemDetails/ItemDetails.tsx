import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSettings } from '../../contexts/SettingsContext';
import { fetchItemContent } from '../../services/hackernews-api';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Comment } from '../../components/Comment/Comment';
import { formatComment } from '../../utils/formatComment';
import './ItemDetails.scss';

export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();

    const { data: item, isLoading, error } = useQuery({
        queryKey: ['item', id],
        queryFn: () => fetchItemContent(Number(id)),
        enabled: !!id,
    });

    if (isLoading) return <div className="main-content"><Loader /></div>;
    if (error) return <div className="main-content"><ErrorMessage message="Could not load item comments." /></div>;
    if (!item) return null;

    const hasUrl = item.url?.indexOf('http') === 0;

    return (
        <div className="main-content">
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
                <div
                    className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}
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
                                {item.points} points by{' '}
                                <Link to={`/user/${item.user}`}>{item.user}</Link>
                            </span>
                        )}
                        <span className={item.type !== 'job' ? 'item-details' : undefined}>
                            {item.time_ago}
                            {item.type !== 'job' && (
                                <span>
                                    {' '}
                                    |{' '}
                                    <Link to={`/item/${item.id}`}>
                                        {formatComment(item.comments_count)}
                                    </Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && item.poll && (
                    <div className="pollResults">
                        {item.poll.map((pollResult, i) => (
                            <div key={i} className="pollContent">
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{
                                        width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}
                {item.content && (
                    <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
                )}
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
