import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage, Loader } from '../shared/components';
import { useSettings } from '../shared/context';
import { useItem } from '../shared/hooks';
import { commentLabel } from '../shared/utils/comment';
import CommentNode from './CommentNode';
import './ItemDetailsPage.scss';

export default function ItemDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { data: item, error } = useItem(Number(id));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!item) {
        return (
            <div className="main-content">
                {error ? <ErrorMessage message="Could not load item comments." /> : <Loader />}
            </div>
        );
    }

    const hasUrl = item.url.indexOf('http') === 0;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;
    const laptopClassName = [
        'laptop',
        item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
        item.text ? 'head-margin' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className="main-content">
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
                <div className={laptopClassName}>
                    {hasUrl ? (
                        <p>
                            <a className="title" href={item.url} target={target} rel={rel}>
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
                                    <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {item.poll.map((pollResult, index) => (
                            <div className="pollContent" key={index}>
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
                <ul className="comment-list">
                    {item.comments.map((comment) => (
                        <li key={comment.id}>
                            <CommentNode comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
