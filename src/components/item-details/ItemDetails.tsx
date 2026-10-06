import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../../context';
import { useItem } from '../../hooks/useItem';
import { useRouteId } from '../../hooks/useRouteId';
import { formatCommentCount, hasExternalUrl, linkTargetProps } from '../../utils';
import { BackButton, ErrorMessage, Loader } from '../shared';
import { Comment } from './Comment';
import './ItemDetails.scss';

function parseItemId(id: string | null): number | null {
    const num = Number(id);
    return id && Number.isInteger(num) && num > 0 ? num : null;
}

export default function ItemDetails() {
    const itemId = parseItemId(useRouteId());
    const { settings } = useSettings();
    const navigate = useNavigate();
    const { data: item, isPending, isError } = useItem(itemId);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (itemId === null || isError) {
        return (
            <div className="main-content item-details-page">
                <ErrorMessage message="Could not load item comments." />
            </div>
        );
    }

    if (isPending) {
        return (
            <div className="main-content item-details-page">
                <Loader />
            </div>
        );
    }

    const hasUrl = hasExternalUrl(item.url);
    const isJob = item.type === 'job';
    const targetProps = linkTargetProps(settings.openLinkInNewTab);
    const title = hasUrl ? (
        <a className="title" href={item.url} {...targetProps}>
            {item.title}
        </a>
    ) : (
        <Link className="title" to={`/item/${item.id}`}>
            {item.title}
        </Link>
    );

    return (
        <div className="main-content item-details-page">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <BackButton onClick={() => navigate(-1)} />
                        {title}
                    </p>
                </div>
                <div className={`laptop${item.comments_count > 0 || isJob ? ' item-header' : ''}`}>
                    <p>
                        {title}
                        {hasUrl && item.domain && (
                            <>
                                {' '}
                                <span className="domain">({item.domain})</span>
                            </>
                        )}
                    </p>
                    <div className="subtext">
                        {!isJob && (
                            <span>
                                {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>{' '}
                            </span>
                        )}
                        <span className={isJob ? undefined : 'item-details'}>
                            {item.time_ago}
                            {!isJob && (
                                <span>
                                    {' | '}
                                    <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {(item.poll ?? []).map((pollResult, index) => (
                            <div key={index} className="pollContent">
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{
                                        width: `${item.poll_votes_count ? (pollResult.points / item.poll_votes_count) * 100 : 0}%`,
                                    }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
                <ul className="comment-list">
                    {(item.comments ?? []).map((comment) => (
                        <li key={comment.id}>
                            <Comment comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
