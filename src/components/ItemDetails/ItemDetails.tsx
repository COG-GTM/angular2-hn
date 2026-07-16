import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Story } from '../../types/story';
import { fetchItemContent } from '../../api/hackernews';
import { useSettings } from '../../context/SettingsContext';
import { formatCommentCount } from '../../utils/formatCommentCount';
import { Comment } from '../Comment/Comment';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import './ItemDetails.scss';

export function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();

    const [item, setItem] = useState<Story | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let cancelled = false;
        const itemID = Number(id);
        fetchItemContent(itemID)
            .then((data) => {
                if (!cancelled) {
                    setItem(data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage('Could not load item comments.');
                }
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    const hasUrl = item ? item.url.indexOf('http') === 0 : false;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;
    const goBack = () => navigate(-1);

    const laptopClasses = ['laptop'];
    if (item && (item.comments_count > 0 || item.type === 'job')) {
        laptopClasses.push('item-header');
    }
    if (item && item.text) {
        laptopClasses.push('head-margin');
    }

    return (
        <div className="main-content item-details-page">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={goBack}></span>
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
                    <div className={laptopClasses.join(' ')}>
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
                                    {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' '}
                                        | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll.map((pollResult, index) => (
                                <div className="pollContent" key={index}>
                                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }} />
                    <ul className="comment-list">
                        {item.comments.map((comment) => (
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
