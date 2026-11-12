import { useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router';

import { ErrorMessage } from '../shared/components/ErrorMessage';
import { Loader } from '../shared/components/Loader';
import type { Story } from '../shared/models/story';
import { useSettings } from '../shared/settings/useSettings';
import { formatCommentCount } from '../shared/utils/comment';
import { hasExternalUrl } from '../shared/utils/has-url';
import { sanitizeHtml } from '../shared/utils/sanitize';
import { scrollTop } from '../shared/utils/scroll';
import { Comment } from './Comment';
import { useItem } from './useItem';
import './ItemDetails.scss';

function Title({ item }: { item: Story }) {
    const { settings } = useSettings();
    return hasExternalUrl(item.url) ? (
        <a
            className="title"
            href={item.url}
            target={settings.openLinkInNewTab ? '_blank' : undefined}
            rel={settings.openLinkInNewTab ? 'noopener' : undefined}
        >
            {item.title}
        </a>
    ) : (
        <NavLink className="title" to={`/item/${item.id}`}>
            {item.title}
        </NavLink>
    );
}

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: item, isError } = useItem(Number(id));

    useEffect(() => {
        scrollTop();
    }, []);

    if (!item) {
        return (
            <div className="app-item-details">
                <div className="main-content">
                    {isError ? <ErrorMessage message="Could not load item comments." /> : <Loader />}
                </div>
            </div>
        );
    }

    const isJob = item.type === 'job';
    const laptopClasses = ['laptop'];
    if (item.comments_count > 0 || isJob) laptopClasses.push('item-header');
    if (item.content) laptopClasses.push('head-margin');

    return (
        <div className="app-item-details">
            <div className="main-content">
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            <Title item={item} />
                        </p>
                    </div>
                    <div className={laptopClasses.join(' ')}>
                        <p>
                            <Title item={item} />
                            {hasExternalUrl(item.url) && item.domain && (
                                <>
                                    {' '}
                                    <span className="domain">({item.domain})</span>
                                </>
                            )}
                        </p>
                        <div className="subtext">
                            {!isJob && (
                                <span>
                                    {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                                </span>
                            )}
                            <span className={isJob ? undefined : 'item-details'}>
                                {item.time_ago}
                                {!isJob && (
                                    <span>
                                        {' '}
                                        |{' '}
                                        <NavLink to={`/item/${item.id}`}>
                                            {formatCommentCount(item.comments_count)}
                                        </NavLink>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll?.map((pollResult, i) => (
                                <div key={i} className="pollContent">
                                    <div dangerouslySetInnerHTML={sanitizeHtml(pollResult.content)}></div>
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
                    <p className="subject" dangerouslySetInnerHTML={sanitizeHtml(item.content)}></p>
                    <ul className="comment-list">
                        {item.comments.map((comment) => (
                            <li key={comment.id}>
                                <Comment comment={comment} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
