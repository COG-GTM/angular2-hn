import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Comment from '../components/Comment';
import { useItem } from '../hooks';
import { useSettings } from '../context/SettingsContext';
import { formatCommentCount } from '../utils/formatCommentCount';
import { Story } from '../models';
import './ItemDetailsPage.scss';

// node-hnapi returns an HTML `content` body (and, for text posts, no `text`
// field) that the frozen Story type omits; mirror the Angular template's
// dynamic property access without mutating the shared model.
type StoryBody = Story & { content?: string; text?: string };

// Port of src/app/item-details/item-details.component.{ts,html,scss}
export default function ItemDetailsPage() {
    const params = useParams();
    const id = Number(params.id);
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { item, loading, error } = useItem(id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const goBack = () => navigate(-1);

    return (
        <div className="main-content">
            {loading && !error && <Loader />}
            {error && <ErrorMessage message="Could not load item comments." />}

            {item && (() => {
                const body = item as StoryBody;
                const hasUrl = item.url.indexOf('http') === 0;
                const laptopClass =
                    'laptop' +
                    (item.comments_count > 0 || item.type === 'job' ? ' item-header' : '') +
                    (body.text ? ' head-margin' : '');

                return (
                    <div className="item">
                        <div className="mobile item-header">
                            <p className="title-block">
                                <span className="back-button" onClick={goBack}></span>
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
                        <div className={laptopClass}>
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
                                            {' '}|{' '}
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
                                        <div
                                            dangerouslySetInnerHTML={{ __html: pollResult.content }}
                                        ></div>
                                        <div className="subtext">{pollResult.points} points</div>
                                        <div
                                            className="pollBar"
                                            style={{
                                                width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p
                            className="subject"
                            dangerouslySetInnerHTML={{ __html: body.content ?? '' }}
                        ></p>
                        <ul className="comment-list">
                            {item.comments.map((comment) => (
                                <li key={comment.id}>
                                    <Comment comment={comment} />
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })()}
        </div>
    );
}
