import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Comment from '../components/Comment';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useItemContent } from '../hooks/useHackerNews';
import { useSettings } from '../context/SettingsContext';
import { formatCommentCount, hasExternalUrl } from '../utils';

export default function ItemDetails() {
    const { id } = useParams();
    const itemID = Number(id);
    const navigate = useNavigate();
    const { openLinkInNewTab } = useSettings();

    const { data: item, isLoading, isError } = useItemContent(itemID);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemID]);

    if (isLoading) {
        return (
            <div className="main-content">
                <Loading />
            </div>
        );
    }

    if (isError || !item) {
        return (
            <div className="main-content">
                <ErrorMessage message="Could not load item comments." />
            </div>
        );
    }

    const hasUrl = hasExternalUrl(item.url);
    const linkTarget = openLinkInNewTab ? '_blank' : undefined;
    const linkRel = openLinkInNewTab ? 'noopener' : undefined;
    const showHeaderBorder = item.comments_count > 0 || item.type === 'job';

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
                                target={linkTarget}
                                rel={linkRel}
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
                    className={`laptop${showHeaderBorder ? ' item-header' : ''}${
                        item.content ? ' head-margin' : ''
                    }`}
                >
                    {hasUrl ? (
                        <p>
                            <a
                                className="title"
                                href={item.url}
                                target={linkTarget}
                                rel={linkRel}
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
                                    {' | '}
                                    <Link to={`/item/${item.id}`}>
                                        {formatCommentCount(item.comments_count)}
                                    </Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                {item.type === 'poll' && item.poll && (
                    <div className="pollResults">
                        {item.poll.map((pollResult, index) => (
                            <div className="pollContent" key={index}>
                                <div
                                    dangerouslySetInnerHTML={{ __html: pollResult.content }}
                                ></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{
                                        width: `${
                                            (pollResult.points /
                                                (item.poll_votes_count || 1)) *
                                            100
                                        }%`,
                                    }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}

                {item.content && (
                    <p
                        className="subject"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                    ></p>
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
