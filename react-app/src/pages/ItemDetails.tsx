import { Link, useNavigate, useParams } from 'react-router-dom';

import { useItem } from '../hooks/useItem';
import { useSettings } from '../hooks/useSettings';
import { formatCommentCount } from '../utils/comment';
import { Comment } from '../components/Comment';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import './ItemDetails.scss';

export default function ItemDetails() {
    const params = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const itemID = params.id ? +params.id : 0;
    const { item, errorMessage } = useItem(itemID);

    const goBack = () => navigate(-1);

    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

    return (
        <div className="item-details-view">
            <div className="main-content">
                {!item && !errorMessage && <Loader />}
                {!item && errorMessage !== '' && (
                    <ErrorMessage message={errorMessage} />
                )}

                {item && (
                    <div className="item">
                        <div className="mobile item-header">
                            <p className="title-block">
                                <span className="back-button" onClick={goBack}></span>
                                {item.url && item.url.indexOf('http') === 0 ? (
                                    <a
                                        className="title"
                                        href={item.url}
                                        target={target}
                                        rel={rel}
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
                            className={
                                'laptop' +
                                (item.comments_count > 0 || item.type === 'job'
                                    ? ' item-header'
                                    : '') +
                                (item.text ? ' head-margin' : '')
                            }
                        >
                            {item.url && item.url.indexOf('http') === 0 ? (
                                <p>
                                    <a
                                        className="title"
                                        href={item.url}
                                        target={target}
                                        rel={rel}
                                    >
                                        {item.title}
                                    </a>
                                    {item.domain && (
                                        <span className="domain">
                                            ({item.domain})
                                        </span>
                                    )}
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
                                        <Link to={`/user/${item.user}`}>
                                            {item.user}
                                        </Link>
                                    </span>
                                )}
                                <span
                                    className={
                                        item.type !== 'job' ? 'item-details' : undefined
                                    }
                                >
                                    {item.time_ago}
                                    {item.type !== 'job' && (
                                        <span>
                                            {' '}
                                            |{' '}
                                            <Link to={`/item/${item.id}`}>
                                                {formatCommentCount(
                                                    item.comments_count
                                                )}
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
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: pollResult.content,
                                            }}
                                        ></div>
                                        <div className="subtext">
                                            {pollResult.points} points
                                        </div>
                                        <div
                                            className="pollBar"
                                            style={{
                                                width:
                                                    (pollResult.points /
                                                        item.poll_votes_count) *
                                                        100 +
                                                    '%',
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
                            {item.comments &&
                                item.comments.map((comment) => (
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
