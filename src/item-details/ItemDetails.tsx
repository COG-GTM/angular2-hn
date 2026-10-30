import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ErrorMessage } from '../shared/components/ErrorMessage/ErrorMessage';
import { Loader } from '../shared/components/Loader/Loader';
import { useItem } from '../shared/hooks/use-hackernews';
import type { Story } from '../shared/models/story';
import { useSettings } from '../shared/settings/settings-context';
import { commentLabel } from '../shared/utils/comment-label';
import { hasUrl, linkTargetProps } from '../shared/utils/link-target';
import { sanitizeHtml } from '../shared/utils/sanitize-html';
import { Comment } from './Comment/Comment';
import './ItemDetails.scss';

// node-hnapi returns the self-post body as `content`, which the original Story model never declared.
type StoryWithContent = Story & { content?: string };

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const itemID = Number(id);
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { data, isError } = useItem(itemID);
    const item = data as StoryWithContent | undefined;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemID]);

    const linkProps = linkTargetProps(settings.openLinkInNewTab);
    const isJob = item?.type === 'job';

    return (
        <div className="item-details-page">
            <div className="main-content">
                {!item && !isError && <Loader />}
                {!item && isError && <ErrorMessage message="Could not load item comments." />}

                {item && (
                    <div className="item">
                        <div className="mobile item-header">
                            <p className="title-block">
                                <span className="back-button" onClick={() => navigate(-1)}></span>
                                {hasUrl(item.url) ? (
                                    <a className="title" href={item.url} {...linkProps}>
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
                            {hasUrl(item.url) ? (
                                <p>
                                    <a className="title" href={item.url} {...linkProps}>
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
                                {!isJob && (
                                    <span>
                                        {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>{' '}
                                    </span>
                                )}
                                <span className={!isJob ? 'item-details' : undefined}>
                                    {item.time_ago}
                                    {!isJob && (
                                        <span>
                                            {' '}
                                            | <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                        {item.type === 'poll' && (
                            <div className="pollResults">
                                {item.poll.map((pollResult, index) => (
                                    <div key={index} className="pollContent">
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
                        <p className="subject" dangerouslySetInnerHTML={sanitizeHtml(item.content)}></p>
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
        </div>
    );
}
